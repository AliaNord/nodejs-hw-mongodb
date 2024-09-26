import createHttpError from "http-errors";
import { deleteContactById, getAllContacts, getContactById, patchContactById, postContact } from "../services/contacts.js";

export const getContactsController = async (req, res) => {
    const contacts = await getAllContacts();
    res.status(200).json({
        status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
};

export const getContactByIdController = async(req, res) => {
    const {contactId} = req.params; 
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

 export const postContactController = async(req, res) => {
    const contactData = await postContact(req.body);
    res.status(201).json({
        status: 201,
        message: 'Successfully created a contact!',
        data: contactData,
    });
 };

 export const deleteContactByIdController = async(req, res) => {
    const {contactId} = req.params;
    const deleteById = await deleteContactById(contactId);
    if (!deleteById) {
        throw createHttpError(404, 'Contact not found');
    }
    res.sendStatus(204);
 };

 export const patchContactByIdController = async(req, res) => {
    const {contactId} = req.params;
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