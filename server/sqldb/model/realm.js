'use strict';

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('realm', {
        _id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });
};