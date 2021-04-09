import * as e from 'express';

require('./envars').envars('./.env');
const fetch = require("node-fetch");
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const { Install, AuthToken } = require('./models');
const { start, toss } = require('./helpers');

app.use(function logRequests(req : e.Request, res : e.Request, next : e.NextFunction) : void {
    console.log(req.method, req.path);
    next();
})

app.post("/duda/manifest", function(req : e.Request, res : e.Response) {
    fetch(`https://api-sandbox.duda.co/api/integrationhub/application/${ req.body.uuid }`, {
        headers: {
            "Accept": "application/json",
            "Authorization": `Basic ${ req.body.token }`,
        }
    })
    .then((response : e.Response) => response.json())
    .then((manifest : any) => res.status(200).json(manifest))
    .catch((error : typeof Error) => {
        console.log(error);
        res.status(500).json({ error: "internal server error" });
    });
})

app.post('/install', function (req : e.Request, res : e.Response) : void {
    try {
        Install.findOneAndUpdate({
            site_name: req.body.site_name,
        }, {
            site_name: req.body.site_name,
            plan_uuid: req.body.app_plan_uuid,
            user_lang: req.body.user_lang,
            installer_uuid: req.body.installer_account_uuid,
            owner_uuid: req.body.account_owner_uuid,
            recurrency: req.body.recurrency,
            free: req.body.free,
        }, {
            new: true,
            upsert: true,
            omitUndefined: true,
            useFindAnyModify: false,
        }, function(err) {
            toss(err, "unable to save new install", function() {
                console.log(req.body.site_name, err);
            })
            AuthToken.findOneAndUpdate({
                site_name: req.body.site_name,
            }, {
                site_name: req.body.site_name,
                type: req.body.auth.type,
                code: req.body.auth.authorization_code,
                refresh: req.body.auth.refresh_token,
                expiration: req.body.auth.expiration_date,
            }, {
                new: true,
                upsert: true,
                omitUndefined: true,
                useFindAnyModify: false,
            }, function (err) {
                toss(err, "unable to save auth", function() {
                    console.log(req.body.site_name, err);
                })
                res.status(200).send("installed");
            })
        })
    } catch (e) {
        res.status(500).send(`internal server error: ${e}`);
    }
});

app.post('/uninstall', function (req : e.Request, res : e.Response) : void {
    try {
        Install.findOneAndDelete({
            site_name: req.body.site_name,
        }, function(err) {
            toss(err, "unable to delete installation", function() {
                console.log(req.body.site_name, err);
            })
            AuthToken.findOneAndDelete({
                site_name: req.body.site_name,
            }, function(err) {
                toss(err, "unable to delete auth", function() {
                    console.log(req.body.site_name, err);
                })
                res.status(200).send("uninstalled");
            })
        })
    } catch (e) {
        res.status(500).send(`internal server error: ${e}`);
    }
})

app.post('/updowngrade', function (req : e.Request, res : e.Response) : void {
    console.log(req.body);
    res.status(200).send("updowngrade");
})

app.post('/webhook', function (req : e.Request, res : e.Response) : void {
    res.status(200).send("webhook received");
})

start(app);