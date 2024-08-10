const ProxmoxService = require('../services/proxmoxService');

const proxmoxService = new ProxmoxService(
    'https://your-proxmox-url:8006', // Base URL der Proxmox-API
    'your-username', // Proxmox-Benutzername
    'your-password', // Proxmox-Passwort
    'pam' // Realm, z.B. pam oder pve
);

exports.getNodes = async (req, res) => {
    try {
        const nodes = await proxmoxService.getNodes();
        res.json(nodes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch nodes' });
    }
};

exports.getNodeStatus = async (req, res) => {
    const { node } = req.params;
    try {
        const status = await proxmoxService.getNodeStatus(node);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: `Failed to fetch status for node ${node}` });
    }
};

exports.startVM = async (req, res) => {
    const { node, vmid } = req.params;
    try {
        const result = await proxmoxService.startVM(node, vmid);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Failed to start VM ${vmid} on node ${node}` });
    }
};

exports.stopVM = async (req, res) => {
    const { node, vmid } = req.params;
    try {
        const result = await proxmoxService.stopVM(node, vmid);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: `Failed to stop VM ${vmid} on node ${node}` });
    }
};
