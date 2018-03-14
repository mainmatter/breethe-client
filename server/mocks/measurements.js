/* eslint-env node */
"use strict";

module.exports = function(app) {
  const express = require("express");
  let measurementsRouter = express.Router();

  measurementsRouter.get("/", function(req, res) {
    res.type("application/vnd.api+json");
    res.json({
      data: [
        {
          type: "measurement",
          id: 1,
          attributes: {
            coordinates: "55.676098, 12.568337",
            measuredId: 1,
            unit: 'ppm',
            value: 34
          },
          relationships: {
            location: {
              data: {
                id: 1,
                type: 'location'
              }
            }
          }
        }
      ]
    });
  });

  measurementsRouter.post("/", function(req, res) {
    res.status(201).end();
  });

  measurementsRouter.get("/:id", function(req, res) {
    res.send({
      measurements: {
        id: req.params.id
      }
    });
  });

  measurementsRouter.put("/:id", function(req, res) {
    res.send({
      measurements: {
        id: req.params.id
      }
    });
  });

  measurementsRouter.delete("/:id", function(req, res) {
    res.status(204).end();
  });

  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/measurements', require('body-parser').json());
  app.use("/api/measurements", measurementsRouter);
};
