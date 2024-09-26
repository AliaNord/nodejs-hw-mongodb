import { Contacts } from '../db/models/contact.js';

export const getAllContacts = () => Contacts.find();

export const getContactById = (id) => Contacts.findById(id);

export const postContact = (contactData) => Contacts.create(contactData);

export const deleteContactById = (id) => Contacts.findByIdAndDelete(id);

export const patchContactById = (id,contactData) => Contacts.findByIdAndUpdate(id, contactData, {new: true});