import { Contacts } from '../db/models/contact.js';
import { createPagination } from '../utils/createPagination.js';

export const getAllContacts = async ({
  page = 1,
  perPage = 4,
  sortOrder = 'asc',
  sortBy = 'name',
  filter = {},
}) => {
  const skip = (page - 1) * perPage;
  const contactsQuery = Contacts.find();

  if (filter.type) {
    contactsQuery.where('contactType').equals(filter.type);
  }
  if (filter.isFavourite || filter.isFavourite === false) {
    contactsQuery.where('isFavourite').equals(filter.isFavourite);
  }

  const [count, contacts] = await Promise.all([
    Contacts.find().merge(contactsQuery).countDocuments(),
    Contacts.find()
      .merge(contactsQuery)
      .skip(skip)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder }),
  ]);
  return {
    contacts,
    ...createPagination(count, page, perPage),
  };
};

export const getContactById = (id) => Contacts.findById(id);

export const postContact = (contactData) => Contacts.create(contactData);

export const deleteContactById = (id) => Contacts.findByIdAndDelete(id);

export const patchContactById = (id, contactData) =>
  Contacts.findByIdAndUpdate(id, contactData, { new: true });
