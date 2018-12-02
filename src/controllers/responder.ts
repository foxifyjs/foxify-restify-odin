import * as Foxify from "foxify";

const responder: Foxify.Handler = (req, res, next) => res.json(req.fro.result);

export default responder;
