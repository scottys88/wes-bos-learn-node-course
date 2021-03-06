const mongoose = require('mongoose');
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');
const multerOptions = {
	storage: multer.memoryStorage(),
	function(req, file, next) {
		const isPhoto = file.mimetype.startsWith('image/') 
			if(isPhoto) {
				next(null, true);
			} else {
				next({ message: 'That filetype isn\'t allowed!'}, false);
			}
	}
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	//check if there's no new file to resize
	if (!req.file) {
		next();
		return;
	}
	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	//now we resize the image
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	//once we have written the photo to memory then keep going
	next();

}

exports.homePage = (req, res) => {
	req.flash('error', 'Something happened');
	req.flash('info', 'Something happened');
	req.flash('warning', 'Something happened');
	req.flash('success', 'Something happened');
	res.render('index');
};

exports.addStore = (req, res) => {
	res.render('editStore', { title: 'Add Store' });
};

exports.createStore = async (req, res) => {
	const store = await (new Store(req.body)).save();
	await store.save();
	req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
	res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
	// 1. Query the database for a list of all stores
	const stores = await (Store.find());
	res.render('stores', {title: 'Stores', stores: stores});
}

exports.editStore = async (req, res) => {
	//1. Find the store given the ID
	const store = await Store.findOne({ _id: req.params.id});
	//2. Confirm they are the owner of the store
	//3. Render out the edit form so users can update
	res.render('editStore', {title: `Edit ${store.name}`, store});
}

exports.updateStore = async (req, res) => {

	req.body.location.type = 'Point';
	//find and update the store
	const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
		new: true, //return the new store instead of the old one
		runValidators: true
	}).exec();
	req.flash('success', `Successfully updated <strong>${store.name}</strong>. 
		<a href="/stores/{store.slug}">View Store -></a>`);
	res.redirect(`/stores/${store._id}/edit`);
	//redirect them to the store and tell them it worked
}

exports.getStoreBySlug = async (req, res, next) => {
	const store = await Store.findOne({ slug: req.params.slug  });
	if(!store) return next();
	res.render('store', { store, title: store.name});

};

exports.getStoresByTag = async (req, res) => {
	const tag = req.params.tag;
	const tagQuery = tag || {$exists: true};
	const tagsPromise = Store.getTagsList();
	const storesPromise = Store.find({ tags: tagQuery });
	const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

	res.render('tags', { tags, title: 'Tags', tag, stores});
};