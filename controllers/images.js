const cloudinary = require('cloudinary');
const HttpStatus = require('http-status-codes');
const User = require('../models/userModels');

cloudinary.config({
    cloud_name: 'dgthwirla',
    api_key: '784193769591988',
    api_secret: '18viCKrwt6ISEAFlWBx5n4QuBBQ'
})

module.exports = {
    uploadImage(req, res, next) {
        cloudinary.uploader.upload(req.body.image, async (result) => {
            console.log(result);

            await User.update({
                _id: req.user._id
            },
                {
                    $push: {
                        images: {
                            imgId: result.public_id,
                            imgVersion: result.version
                        }
                    }
                }).then(() => {
                    res.status(HttpStatus.OK).json({ message: 'Image uploaded successfully' })
                }).catch((err) => {
                    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error occured' })
                })
        })
    },
    async setDefaultImage(req, res, next) {
        const { imgId, imgVersion } = req.params;
        await User.update({
            _id: req.user._id
        },
            {
                picId: `${imgId}.jpg`,
                picVersion: imgVersion
            }).then(() => {
                res.status(HttpStatus.OK).json({ message: 'Default image set' })
            }).catch((err) => {
                res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'error occured' })
            })
    }
}