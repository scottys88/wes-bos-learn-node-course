const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const AuthController = require('../controllers/AuthController');
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', catchErrors(storeController.getStores));
router.get('/stores', catchErrors(storeController.getStores));
router.get('/add', AuthController.isLoggedIn, storeController.addStore);

router.post('/add', 
    storeController.upload, 
    catchErrors(storeController.resize), 
    catchErrors(storeController.createStore));

router.post('/add/:id',    
    storeController.upload, 
    catchErrors(storeController.resize), 
    catchErrors(storeController.updateStore));

router.get('/stores/:id/edit', catchErrors(storeController.editStore));

router.get('/store/:slug', catchErrors(storeController.getStoreBySlug));

router.get('/tags', catchErrors(storeController.getStoresByTag));
router.get('/tags/:tag', catchErrors(storeController.getStoresByTag));

router.get('/login', userController.loginForm);
router.post('/login', AuthController.login);
router.get('/register', userController.registerForm);

router.post('/register', 
    userController.validateRegister,
    userController.register,
    AuthController.login
    );


router.get('/logout', AuthController.logout);

router.get('/account', AuthController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));

router.post('/account/forgot', catchErrors(AuthController.forgot));
router.get('/account/reset/:token', catchErrors(AuthController.reset));
router.post('/account/reset/:token', 
    AuthController.confirmedPasswords, 
    catchErrors(AuthController.update)
);

//1validate the registration data
//2 register the user
//3 Log them in

module.exports = router;
