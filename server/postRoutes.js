
module.exports = function(app){

  app.get('/api/posts', function(req, res) {
    res.send('You hit an ExpressJS route!');
  });

  app.get('/api/post/:id', function(req, res) {
    res.send('You hit an ExpressJS route with ' + req.params.id);
  });

  app.post('/api/posts', function(req, res) {
    
  });

  app.put('/api/post/:id', function(req, res) {

  });

  app.delete('/api/post/:id', function(req, res) {

  });

};
