import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  deleteContactByIdController,
  getContactByIdController,
  getContactsController,
  patchContactByIdController,
  postContactController,
} from '../controllers/contacts.js';
import { validateBody } from '../middlewares/validateBody.js';
import { createContactValidationSchema } from '../validation/createContactValidationSchema.js';
import { updateContactValidationSchema } from '../validation/updateContactValidationSchema.js';
import { isValidId } from '../middlewares/isValidId.js';

const contactsRouter = Router();

contactsRouter.use('/:contactId', isValidId('contactId'));

contactsRouter.get('/', ctrlWrapper(getContactsController));

contactsRouter.get('/:contactId', ctrlWrapper(getContactByIdController));

contactsRouter.post(
  '/',
  validateBody(createContactValidationSchema),
  ctrlWrapper(postContactController),
);

contactsRouter.delete(
  '/:contactId',
  validateBody(updateContactValidationSchema),
  ctrlWrapper(deleteContactByIdController),
);

contactsRouter.patch('/:contactId', ctrlWrapper(patchContactByIdController));

export default contactsRouter;
