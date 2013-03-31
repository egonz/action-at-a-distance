var _ = require('underscore')._
    , quantumEntanglement = {};

quantumEntanglement.configure = function() {

}

quantumEntanglement.NonLocalCorrelation = function(uuid, socket, ghost, spookySock) {

    this.uuid = uuid;
    this.socket = socket;
    this.ghost = ghost;
    this.spookySock = spookySock;

};

quantumEntanglement.NonLocalCorrelations = function() {

    var nonLocalFields = [];

    return {
        addNonLocalCorrelation: function(socket, ghost) {
            socket.ghost = ghost;
            var nonLocalCorrelation = new quantumEntanglement.NonLocalCorrelation(socket.uuid, socket, ghost);
            nonLocalFields.push(nonLocalCorrelation);
        },

        getNonLocalCorrelation: function(uuid) {
            var nonLocalCorrelation = _(nonLocalFields).where({"uuid": uuid});
            return nonLocalCorrelation ? nonLocalCorrelation[0] : null;
        },

        removeNonLocalCorrelation: function(uuid) {
            nonLocalFields = _(nonLocalFields).reject(function(el) { return el.uuid === uuid; });
        }
    }

}();

module.exports = quantumEntanglement;