import createHttpError from 'http-errors';
import {
  deleteContactById,
  getAllContacts,
  getContactById,
  patchContactById,
  postContact,
} from '../services/contacts.js';
import { validatePadinationParams } from '../utils/validation/parsePaginationParams.js';
import { parseSortParams } from '../utils/validation/parseSortParams.js';
import { parseFilterParams } from '../utils/validation/parseFilterParams.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = validatePadinationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filter = parseFilterParams(req.query);

  const contacts = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const contactById = await getContactById(contactId);
  if (!contactById) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully found contact with id {contactId}!',
    data: contactById,
  });
};

export const postContactController = async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({
      status: 400,
      message: 'User ID is missing',
    });
  }
  const contactData = await postContact({ ...req.body, userId });
  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: contactData,
  });
};

export const deleteContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const deleteById = await deleteContactById(contactId);
  if (!deleteById) {
    throw createHttpError(404, 'Contact not found');
  }
  res.sendStatus(204);
};

export const patchContactByIdController = async (req, res) => {
  const { contactId } = req.params;
  const patchContact = await patchContactById(contactId);
  if (!patchContact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a product!',
    data: patchContact,
  });
};
