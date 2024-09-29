module.exports = (app) => {

  app.all("*", (req, res) => {
      res.status(404).send({
          apisStatus: false,
          message: "Invalid URL",
          data: {},
      });
  });
};
