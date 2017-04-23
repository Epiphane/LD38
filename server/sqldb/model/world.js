'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('world', {
        _id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        tiles: DataTypes.ARRAY(DataTypes.INTEGER),
        occupants: DataTypes.ARRAY(DataTypes.INTEGER),
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

        performUpdates: function(updates) {
            var self = this;

            var updateSql = [];
            var updateReplacements = [];
            updates.forEach((update) => {
                switch (update[0]) {
                case 0: // tile
                    updateSql.push('tiles[?] = ?');
                    break;
                case 1: // occupant
                    updateSql.push('occupants[?] = ?');
                    break;
                }
                updateReplacements.push(update[1], update[2])
            });

            updateReplacements.push(this._id);
            return sequelize.query('UPDATE worlds SET ' + updateSql.join(',') + ' WHERE _id = ?', {
                replacements: updateReplacements
            }).then(() => {
                return updates;
            });
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
                return [0 /* tile */, index, value];
            });
        },

        setOccupant: function(index, value) {
            return Promise.resolve().then(() => {
                if (this.occupants[index] === value)
                    return [index, value];

                this.occupants[index] = value;

                // Don't wait on the query
                sequelize.query('UPDATE worlds SET occupants[?] = ? WHERE _id = ?', {
                    replacements: [index, value, this._id]
                });
                return [1 /* occupant */, index, value];
            });
        }
      }
    });
};