var models  = require('../../models');

function fetchAssets(UserId, callback) {
  models.User.findOne({
    attributes: ['id', 'AccountId', 'primaryHierarchyIds', 'secondaryHierarchyIds'],
    where: {
      id: UserId
    }
  }).then(function(user) {
    if (!user) {
      return callback({ success: false, results: [], message: 'User not found.' });
    }
    var primaryHierarchyIds = user.primaryHierarchyIds ? user.primaryHierarchyIds : [];
    if (!primaryHierarchyIds.length) {
      return callback({ success: true, results: [] });
    }
    models.Asset.findAll({
      attributes: ['id', 'hierarchyIds'],
      where: {
        AccountId: user.AccountId,
        hierarchyIds: { $overlap: user.secondaryHierarchyIds }
      },
    }).then(assets => {
      var assetIds = assets.map(asset => {
        return asset.id;
      });
      return callback({ success: true, results: assetIds });
    }).catch(function (err) {
      return callback({ success: false, results: [], message: 'Error fetching assets.' });
    });
  }).catch(function (err) {
    return callback({ success: false, results: [], message: 'Error fetching user.' });
  });
}

function fetchZones(UserId, callback) {
  models.User.findOne({
    attributes: ['id', 'AccountId', 'primaryHierarchyIds', 'secondaryHierarchyIds'],
    where: {
      id: UserId
    }
  }).then(function(user) {
    if (!user) {
      return callback({ success: false, results: [], message: 'User not found.' });
    }
    var primaryHierarchyIds = user.primaryHierarchyIds ? user.primaryHierarchyIds : [];
    if (!primaryHierarchyIds.length) {
      return callback({ success: true, results: [] });
    }
    models.Geozone.findAll({
      attributes: ['id', 'hierarchyIds'],
      where: {
        AccountId: user.AccountId,
        hierarchyIds: { $overlap: user.secondaryHierarchyIds }
      },
    }).then(geozones => {
      var geoZoneIds = geozones.map(geozone => {
        return geozone.id;
      });
      return callback({ success: true, results: geoZoneIds });
    }).catch(function (err) {
      return callback({ success: false, results: [], message: 'Error fetching zones.' });
    });
  }).catch(function (err) {
    return callback({ success: false, results: [], message: 'Error fetching user.' });
  });
}

function fetchRoutes(UserId, callback) {
  models.User.findOne({
    attributes: ['id', 'AccountId', 'primaryHierarchyIds', 'secondaryHierarchyIds'],
    where: {
      id: UserId
    }
  }).then(function(user) {
    if (!user) {
      return callback({ success: false, results: [], message: 'User not found.' });
    }
    var primaryHierarchyIds = user.primaryHierarchyIds ? user.primaryHierarchyIds : [];
    if (!primaryHierarchyIds.length) {
      return callback({ success: true, results: [] });
    }
    models.Route.findAll({
      attributes: ['id', 'hierarchyIds'],
      where: {
        AccountId: user.AccountId,
        hierarchyIds: { $overlap: user.secondaryHierarchyIds }
      },
    }).then(routes => {
      var routeIds = routes.map(route => {
        return route.id;
      });
      return callback({ success: true, results: routeIds });
    }).catch(function (err) {
      return callback({ success: false, results: [], message: 'Error fetching routes.' });
    });
  }).catch(function (err) {
    return callback({ success: false, results: [], message: 'Error fetching user.' });
  });
}


function fetchHierarchies(data, callback) {
  let hierarchyIds = data.id;
  if (!hierarchyIds.length) {
    return callback({ success: true, results: [], allHierarchies: [] });
  }
  var sql = `
    With Recursive Subordinates As
    (
      Select id, "name", "level", "HierarchyParentId", "AccountId" From "Hierarchies" Where id in (:hierarchyIds)
      Union
      Select VH.id, VH."name", VH."level", VH."HierarchyParentId", VH."AccountId" From "Hierarchies" VH
      Inner Join Subordinates S On VH."HierarchyParentId" = S.id
    )
    Select * From Subordinates Where id not in (:hierarchyIds) or id in (:hierarchyIds)  and "AccountId"= :AccountId;`;
  Promise.all([
    models.sequelize.query(sql, {
      replacements: { 
        AccountId: data.AccountId,
        hierarchyIds: hierarchyIds
      },
      type: models.sequelize.QueryTypes.SELECT
    }),
    models.Hierarchy.findAll({
      where: {
        AccountId: data.AccountId
      }
    })
  ]).then(([hierarchies, allHierarchies]) => {
    return callback({ success: true, results: hierarchies, allHierarchies: allHierarchies });
  }).catch(function (err) {
    return callback({ success: false, results: [], allHierarchies: [], message: 'Error fetching hierarchies.' });
  });
}

async function fetchHierarchiesAsync(data) {
  try {
    let hierarchyIds = data.id;
    if (!hierarchyIds.length) {
      return { success: true, results: [], allHierarchies: [] };
    }
    var sql = `
      With Recursive Subordinates As
      (
        Select id, "name", "level", "HierarchyParentId", "AccountId" From "Hierarchies" Where id in (:hierarchyIds)
        Union
        Select VH.id, VH."name", VH."level", VH."HierarchyParentId", VH."AccountId" From "Hierarchies" VH
        Inner Join Subordinates S On VH."HierarchyParentId" = S.id
      )
      Select * From Subordinates Where id not in (:hierarchyIds) or id in (:hierarchyIds)  and "AccountId"= :AccountId;`;
    let hierarchies = await models.sequelize.query(sql, {
      replacements: { 
        AccountId: data.AccountId,
        hierarchyIds: hierarchyIds
      },
      type: models.sequelize.QueryTypes.SELECT
    });
    let allHierarchies = await models.Hierarchy.findAll({
      where: {
        AccountId: data.AccountId
      }
    });
    return { success: true, results: hierarchies, allHierarchies: allHierarchies };
  }
  catch (err) {
    return { success: false, error: err, results: [], allHierarchies: [], message: 'Error fetching hierarchies.'};
  }
}

function fetchUsers(data, callback) {
  models.Asset.findOne({
    attributes: ['id', 'hierarchyIds'],
    where: {
      id: data.AssetId,
      AccountId: data.AccountId
    }
  }).then(Asset => {
    if (!Asset) {
      return callback({ success: false, results: [], message: 'Asset not found' });
    }
    models.User.findAll({
      attributes: ['id', 'primaryHierarchyIds', 'secondaryHierarchyIds', 'email', 'push',
        'emailNotification', 'mobile', 'smsNotification', 'notificationTypes'],
      where: {
        AccountId: data.AccountId,
        secondaryHierarchyIds: {
          $overlap: Asset.hierarchyIds
        }
      }
    }).then(Users => {
      return callback({ success: true, results: Users });
    }).catch(function (err) {
      return callback({ success: false, results: [], message: 'Error fetching asset hierarchies' });
    });
  }).catch(function (err) {
    return callback({ success: false, results: [], message: 'Error fetching asset' });
  });
}

module.exports = {
  fetchAssets : fetchAssets,
  fetchZones : fetchZones,
  fetchRoutes : fetchRoutes,
  fetchHierarchies : fetchHierarchies,
  fetchHierarchiesAsync : fetchHierarchiesAsync,
  fetchUsers: fetchUsers
}
