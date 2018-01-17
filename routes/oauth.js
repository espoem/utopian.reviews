var express = require('express');
var steem = require('../utils/steem')
let utopian = require('utopian-api');
var router = express.Router();

router.get("/t", (req, res) => {

  res.send("hi")
})

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (!req.query.access_token) {
    let uri = steem.getLoginURL();
    res.redirect(uri);
  } else {
    steem.setAccessToken(req.query.access_token);
    steem.me(function (err, response) {
      let mod = utopian.getModerator(response.user);
      mod.then((mod) => {
          if (mod.length === 1 && mod[0].account === response.user) {

            let type = "supervisor"
            if (!mod[0].supermoderator) {
              type = "moderator"
            }
            response.account.json_metadata = JSON.parse(response.account.json_metadata);
            response.access_token = req.query.access_token;
            response.utopian = {
              user: mod,
              type: type
            };
            req.session.steem = response;
            res.redirect("/v")

          } else {
            req.session.noMod = response.user;
            res.redirect('/?noMod=true')
          }
        }
      );
    });
  }
});

router.get('/destroy', (req, res) => {
  req.session.destroy();
  res.redirect("/")
});

module.exports = router;
