import * as Foxify from "foxify";

const responder: Foxify.Handler = function foxify_restify_odin_responder(req, res) {
  res.json(req.fro.result);
};

export default responder;
