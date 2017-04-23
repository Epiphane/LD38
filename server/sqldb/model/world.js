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
        },

        setTile: function(index, value) {
            return Promise.resolve().then(() => {
                if (this.tiles[index] === value)
                    return [index, value];

                this.tiles[index] = value;

                // Don't wait on the query
                sequelize.query('UPDATE worlds SET tiles[?] = ? WHERE _id = ?', {
                    replacements: [index, value, this._id]
                });
                return [index, value];
            });
        }
      }
    });
};