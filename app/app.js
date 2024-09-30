module.exports = (app) => {

  app.use("/api/user/", require("../routes/user.routes"));

  app.all("*", (req, res) => {
      res.status(404).send({
          apisStatus: false,
          message: "Invalid URL",
          data: {},
      });
  });
};
