import Express from "express";

const clean = Express.Router();
clean.route("/").post((req,res) => {
    console.log("Success");
});

export default clean;