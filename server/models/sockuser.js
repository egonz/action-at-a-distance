/**
 * Created with JetBrains WebStorm.
 * User: egonz
 * Date: 2/17/13
 * Time: 6:51 PM
 * To change this template use File | Settings | File Templates.
 */

 var _ = require('underscore')._,
	Backbone = require('backbone');

var sockUserModels = {};

sockUserModels.SockUser = Backbone.Model.extend({

    defaults: {

    },

    initialize: function() {
        this.guid = this.get('guid');
        this.socket = this.get('socket');
        this.spooky = this.get('spooky');
        this.spookySocket = this.get('spookySocket');
    }
});

//
//Collections
//

sockUserModels.SockUserCollection = Backbone.Collection.extend({
    model: sockUserModels.SockUser
});

module.exports = sockUserModels;