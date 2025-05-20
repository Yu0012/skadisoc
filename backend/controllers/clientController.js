const FacebookClient = require('../models/FacebookClient');
const InstagramClient = require('../models/InstagramClient');
const TwitterClient = require('../models/TwitterClient');
const Client = require('../models/Client');
const User = require('../models/User');

// CREATE Client (Admin only)
exports.createClient = async (req, res) => {
    try {
        console.log('🟢 Creating new client');
        if (req.user.role !== 'admin') {
            console.log('⛔ Create client failed: not admin');
            return res.status(403).json({ message: 'Only admin can create clients' });
        }

        const newClient = new Client(req.body);
        await newClient.save();

        console.log('✅ Client created:', newClient.companyName);
        res.json({ message: 'Client created successfully', client: newClient });
    } catch (err) {
        console.error('❌ Error creating client:', err);
        res.status(500).json({ message: 'Error creating client' });
    }
};

// GET All Clients (Admin see all, Editor see assigned only)
exports.getClients = async (req, res) => {
    try {
        console.log('🟢 Fetching clients');

        let clients;
        let query = {};
        if (req.user.role === 'admin') {
            query = { assignedAdmins: req.user._id };
        } 

        else if (req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'Permission denied' });
        } 

        const [facebookClients, instagramClients, twitterClients] = await Promise.all([
        FacebookClient.find(query).populate('assignedAdmins', 'username'),
        InstagramClient.find(query).populate('assignedAdmins', 'username'),
        TwitterClient.find(query).populate('assignedAdmins', 'username'),
        ]);

        res.json({ facebookClients, instagramClients, twitterClients });
    } 
    
    catch (err) {
        console.error('❌ Error fetching clients:', err);
        res.status(500).json({ message: 'Error fetching clients' });
    }
};

// UPDATE Client (Admin only)
exports.updateClient = async (req, res) => {
    try {
        console.log('🟠 Updating client');
        if (req.user.role !== 'admin') {
            console.log('⛔ Update client failed: not admin');
            return res.status(403).json({ message: 'Only admin can update clients' });
        }

        const { id } = req.params;
        const updatedClient = await Client.findByIdAndUpdate(id, req.body, { new: true });

        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        console.log('✅ Client updated:', updatedClient.companyName);
        res.json({ message: 'Client updated successfully', client: updatedClient });
    } catch (err) {
        console.error('❌ Error updating client:', err);
        res.status(500).json({ message: 'Error updating client' });
    }
};

// DELETE Client (Admin only)
exports.deleteClient = async (req, res) => {
    try {
        console.log('🔴 Deleting client');
        if (req.user.role !== 'admin') {
            console.log('⛔ Delete client failed: not admin');
            return res.status(403).json({ message: 'Only admin can delete clients' });
        }

        const { id } = req.params;

        const deletedClient = await Client.findByIdAndDelete(id);

        if (!deletedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }

        console.log('✅ Client deleted:', deletedClient.companyName);

        // Remove client from assignedAdmins
        await User.updateMany(
            { assignedClients: deletedClient._id },
            { $pull: { assignedClients: deletedClient._id } }
        );

        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        console.error('❌ Error deleting client:', err);
        res.status(500).json({ message: 'Error deleting client' });
    }
};

// ASSIGN user (editor) to client
exports.assignAdminToClient = async (req, res) => {
    try {
        console.log('🟡 Assigning admin to client');
        if (req.user.role !== 'admin') {
            console.log('⛔ Assign failed: not admin');
            return res.status(403).json({ message: 'Only admin can assign users to clients' });
        }

        const { clientId, userId } = req.body;

        const client = await Client.findById(clientId);
        const user = await User.findById(userId);

        if (!client || !user) {
            return res.status(404).json({ message: 'Client or User not found' });
        }

        if (user.role !== 'editor') {
            return res.status(400).json({ message: 'Only editors can be assigned to clients' });
        }

        // Add user to client assignedAdmins
        if (!client.assignedAdmins.includes(userId)) {
            client.assignedAdmins.push(userId);
            await client.save();
        }

        // Add client to user's assignedClients
        if (!user.assignedClients.includes(clientId)) {
            user.assignedClients.push(clientId);
            await user.save();
        }

        console.log(`✅ Assigned ${user.username} to client ${client.companyName}`);
        res.json({ message: 'User assigned to client successfully' });
    } catch (err) {
        console.error('❌ Error assigning user to client:', err);
        res.status(500).json({ message: 'Error assigning user to client' });
    }
};

// UNASSIGN a client from a user (Admin only)
exports.unassignClientFromUser = async (req, res) => {
    console.log('🧹 Unassigning client from user');
    const { clientId, userId } = req.body;
  
    try {
      // Only 'admin' can unassign
      if (req.user.role !== 'admin') {
        console.log('⛔ Unassign failed: not admin');
        return res.status(403).json({ message: 'Only admin can unassign clients' });
      }
  
      const client = await Client.findById(clientId);
      const user = await User.findById(userId);
  
      if (!client || !user) {
        console.log('❌ Unassign failed: client or user not found');
        return res.status(404).json({ message: 'Client or User not found' });
      }
  
      // Remove userId from client.assignedAdmins
      client.assignedAdmins = client.assignedAdmins.filter(adminId => adminId.toString() !== userId);
  
      // Remove clientId from user.assignedClients
      user.assignedClients = user.assignedClients.filter(cId => cId.toString() !== clientId);
  
      await client.save();
      await user.save();
  
      console.log(`✅ Unassigned Client (${client.companyName}) from User (${user.username})`);
      res.json({ message: 'Client unassigned from user successfully' });
    } catch (err) {
      console.error('❌ Error unassigning client:', err);
      res.status(500).json({ message: 'Error unassigning client' });
    }
  };
