'use strict';

module.exports = function(Model, options) {
  Model.on('attached', function() {
    var relations = Model.settings.relations || Model.relations;

    if (relations) {
      Object.keys(relations).forEach(function(targetModel) {
        var type =
          (relations[targetModel].modelThrough || relations[targetModel].through) ?
            'hasManyThrough' : relations[targetModel].type;

        if (type === 'hasManyThrough') {
          Model.afterRemote('prototype.__get__' + targetModel, injectIncludes);
        }
      });
    }
  });

  function injectIncludes(ctx, unused, next) {
    if (!ctx.result || !ctx.result.length) return next();

    var relationName = ctx.methodString.match(/__([a-z\d]+)$/)[1];

    if (
      !(options.relations && options.relations.indexOf(relationName) !== -1) &&
      !(ctx.args.filter && JSON.parse(ctx.args.filter).includeThrough)
    ) return next();

    var relationKey = Model.relations[relationName].keyTo;
    var throughKey = Model.relations[relationName].keyThrough;
    var relationModel = Model.relations[relationName].modelTo;
    var throughModel = Model.relations[relationName].modelThrough;
    var idName = relationModel.definition.idName() || 'id';

    var newResult = JSON.parse(JSON.stringify(ctx.result));

    var query = {where: {}};
    query.where[relationKey] = ctx.instance.id;
    query.where[throughKey] = {inq: newResult.map(function(item) { return item[idName]; })};

    if (
      ctx.args.filter &&
      JSON.parse(ctx.args.filter).includeThrough &&
      JSON.parse(ctx.args.filter).includeThrough.fields
    ) {
      query.fields = [throughKey, JSON.parse(ctx.args.filter).includeThrough.fields];
    } else if (options.fields && options.fields[relationName]) {
      query.fields = [throughKey, options.fields[relationName]];
    }

    throughModel.find(query, function(err, results) {
      if (err) return next();

      var resultsHash = {};
      results.forEach(function(result) {
        resultsHash[result[throughKey].toString()] = result;
      });

      for (var i = 0; i < newResult.length; i++) {
        if (resultsHash[newResult[i][idName].toString()]) {
          newResult[i][throughModel.definition.name] = resultsHash[newResult[i][idName].toString()];
        }
      }

      ctx.result = newResult;

      next();
    });
  };
};
