'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('world', {
        _id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tiles: {
            type: DataTypes.ARRAY(DataTypes.INTEGER)
        },
        width: {
            type: DataTypes.INTEGER,
            defaultValue: 100
        },
        height: {
            type: DataTypes.INTEGER,
            defaultValue: 100
        }
    }, {
      instanceMethods: {
        toJSON: function () {
          var values = Object.assign({}, this.get());

          delete values._id;
          return values;
        }
      }
    });
};