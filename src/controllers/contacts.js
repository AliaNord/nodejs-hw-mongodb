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
import { env } from '../utils/env.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';

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
    userId: req.user._id,
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
  const photo = req.file;
  let photoUrl;

  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }

  const data = { ...req.body, userId, photo: photoUrl };

  const contactData = await postContact(data);
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
  const photo = req.file;
  let photoUrl;
  if (photo) {
    if (env('ENABLE_CLOUDINARY') === 'true') {
      photoUrl = await saveFileToCloudinary(photo);
    } else {
      photoUrl = await saveFileToUploadDir(photo);
    }
  }
  const payload = {
    ...req.body,
    photo: photoUrl,
  };
  const patchContact = await patchContactById(contactId, payload, req.user._id);
  if (!patchContact) {
    throw createHttpError(404, 'Contact not found');
  }
  res.status(200).json({
    status: 200,
    message: 'Successfully patched a product!',
    data: patchContact,
  });
};
