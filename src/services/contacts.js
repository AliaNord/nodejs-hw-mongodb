import { Contacts } from '../db/models/contact.js';
import { createPagination } from '../utils/createPagination.js';

export const getAllContacts = async ({
  userId,
  page = 1,
  perPage = 4,
  sortOrder = 'asc',
  sortBy = 'name',
  filter = {},
}) => {
  const skip = (page - 1) * perPage;
  const contactsQuery = Contacts.find({ userId });

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

export const getContactById = (id, userId) =>
  Contacts.findById({ _id: id, userId });

export const postContact = (contactData) => Contacts.create(contactData);

export const deleteContactById = (id, userId) =>
  Contacts.findByIdAndDelete({ _id: id, userId });

export const patchContactById = (id, contactData, userId) =>
  Contacts.findByIdAndUpdate({ _id: id, userId }, contactData, { new: true });
