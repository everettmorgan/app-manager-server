const mongoose = require('./mongoose');

const InstallSchema = new mongoose.Schema({
    site_name: {
        type: String,
        requried: true,
    },
    plan_uuid: {
        type: String,
        required: true,
    },
    user_lang: {
        type: String,
        required: true,
    },
    installer_uuid: {
        type: String,
        required: true,
    },
    owner_uuid: {
        type: String,
        required: true,
    },
    recurrency: {
        type: String,
        required: false,
    },
    free: {
        type: Boolean,
        required: true,
    }
});

export const Install = mongoose.model('Install', InstallSchema);

const AuthTokenSchema = new mongoose.Schema({
    site_name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    refresh: {
        type: String,
        required: true,
    },
    expirtation: {
        type: Number,
        required: true,
    },
});

export const AuthToken = mongoose.model('AuthToken', AuthTokenSchema);