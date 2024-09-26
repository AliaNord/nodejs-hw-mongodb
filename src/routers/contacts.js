import { Router } from "express";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { deleteContactByIdController, getContactByIdController, getContactsController, patchContactByIdController, postContactController } from "../controllers/contacts.js";

const contactsRouter = Router();

contactsRouter.get('/', ctrlWrapper(getContactsController));

contactsRouter.get('/:contactId', ctrlWrapper(getContactByIdController));

contactsRouter.post('/', ctrlWrapper(postContactController));

contactsRouter.delete('/:contactId', ctrlWrapper(deleteContactByIdController));

contactsRouter.patch('/:contactId', ctrlWrapper(patchContactByIdController));

export default contactsRouter;