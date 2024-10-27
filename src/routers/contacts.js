import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  deleteContactByIdController,
  getContactByIdController,
  getContactsController,
  patchContactByIdController,
  postContactController,
} from '../controllers/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { createContactValidationSchema } from '../validation/createContactValidationSchema.js';
import { validateBody } from '../middlewares/validateBody.js';
import { updateContactValidationSchema } from '../validation/updateContactValidationSchema.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/multer.js';

const contactsRouter = Router();

contactsRouter.use('/:contactId', isValidId('contactId'));
contactsRouter.use('/', authenticate);

contactsRouter.get('/', authenticate, ctrlWrapper(getContactsController));

contactsRouter.get('/:contactId', ctrlWrapper(getContactByIdController));

contactsRouter.post(
  '/',
  upload.single('photo'),
  validateBody(createContactValidationSchema),
  ctrlWrapper(postContactController),
);

contactsRouter.delete(
  '/:contactId',
  validateBody(updateContactValidationSchema),
  ctrlWrapper(deleteContactByIdController),
);

contactsRouter.patch(
  '/:contactId',
  upload.single('photo'),
  validateBody(updateContactValidationSchema),
  ctrlWrapper(patchContactByIdController),
);

export default contactsRouter;
