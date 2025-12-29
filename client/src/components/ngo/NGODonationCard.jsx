// components/NGODonationCard.jsx
import { useState } from 'react';
import { Users, Globe, Lock, Shield, Check, X, UserPlus, Eye, AlertCircle } from 'lucide-react';

const NGODonationCard = ({ donation, onUpdatePermissions, onApproveVolunteer }) => {
    const [showPermissions, setShowPermissions] = useState(false);
    
    // Safe defaults for donation data
    const safeDonation = {
        _id: donation?._id || '',
        title: donation?.title || 'Untitled Donation',
        description: donation?.description || 'No description available',
        quantity: donation?.quantity || 'Unknown',
        permissions: donation?.permissions || 'private', // Default to private
        donor: donation?.donor || { name: 'Unknown Donor', address: 'Address not available' },
        claimedBy: donation?.claimedBy || { name: 'Unknown' },
        approvedVolunteers: donation?.approvedVolunteers || [],
        visibleTo: donation?.visibleTo || [],
        managingNgo: donation?.managingNgo || null
    };
    
    const [selectedPermission, setSelectedPermission] = useState(safeDonation.permissions);
    const [selectedVolunteers, setSelectedVolunteers] = useState([]);
    
    const permissionOptions = [
        { value: 'private', label: 'Private', icon: Lock, description: 'Only approved volunteers can see', color: 'bg-red-100 text-red-600' },
        { value: 'ngo_only', label: 'NGO Managed', icon: Shield, description: 'NGO assigns volunteers manually', color: 'bg-blue-100 text-blue-600' },
        { value: 'all_volunteers', label: 'Public', icon: Globe, description: 'All volunteers can see and claim', color: 'bg-green-100 text-green-600' }
    ];
    
    // Safe getter for current permission option
    const getCurrentPermissionOption = () => {
        return permissionOptions.find(opt => opt.value === safeDonation.permissions) || permissionOptions[0];
    };

    
    
    const currentPermissionOption = getCurrentPermissionOption();
    
    const handlePermissionChange = async (permission) => {
        if (!safeDonation._id) {
            console.error('No donation ID');
            return;
        }
        
        if (window.confirm(`Change permission to ${permission}?`)) {
            try {
                if (onUpdatePermissions) {
                    await onUpdatePermissions(safeDonation._id, permission);
                    setSelectedPermission(permission);
                }
            } catch (error) {
                console.error('Failed to update permissions:', error);
                alert('Failed to update permissions. Please try again.');
            }
        }
    };
    
    const handleApproveVolunteer = async (volunteerId, status) => {
        if (!safeDonation._id || !volunteerId) {
            console.error('Missing donation ID or volunteer ID');
            return;
        }
        
        try {
            if (onApproveVolunteer) {
                await onApproveVolunteer(safeDonation._id, volunteerId, status);
            }
        } catch (error) {
            console.error('Failed to approve volunteer:', error);
            alert('Failed to update volunteer status. Please try again.');
        }
    };
    
    // If donation is undefined/null, show error state
    if (!donation) {
        return (
            <div className="bg-white rounded-2xl border border-red-200 p-6 mb-4">
                <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <h3 className="font-bold">Donation data unavailable</h3>
                </div>
                <p className="text-red-500 text-sm mt-2">This donation could not be loaded. Please refresh the page.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-slate-900">{safeDonation.title}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                            {safeDonation.quantity}
                        </span>
                    </div>
                    <p className="text-slate-600 text-sm">{safeDonation.description}</p>
                </div>
                
                {/* Permission Badge */}
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${currentPermissionOption.color}`}>
                        <currentPermissionOption.icon className="h-3 w-3" />
                        {currentPermissionOption.label}
                    </span>
                    <button
                        onClick={() => setShowPermissions(!showPermissions)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Manage permissions"
                    >
                        <Users className="h-4 w-4 text-slate-600" />
                    </button>
                </div>
            </div>
            
            {/* Donation Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <span className="text-slate-500">From:</span>
                    <p className="font-medium">{safeDonation.donor?.name}</p>
                </div>
                <div>
                    <span className="text-slate-500">Location:</span>
                    <p className="font-medium truncate">{safeDonation.donor?.address}</p>
                </div>
            </div>
            
            {/* Permission Management Panel */}
            {showPermissions && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Manage Access
                    </h4>
                    
                    {/* Permission Options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        {permissionOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handlePermissionChange(option.value)}
                                className={`p-4 rounded-xl border text-left transition-all ${safeDonation.permissions === option.value 
                                    ? 'border-blue-300 bg-blue-50' 
                                    : 'border-slate-200 hover:border-blue-200 hover:bg-blue-50/50'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`p-2 rounded-lg ${option.color.replace('text-', 'bg-').replace('100', '50')}`}>
                                        <option.icon className={`h-4 w-4 ${option.color}`} />
                                    </div>
                                    <span className="font-bold">{option.label}</span>
                                </div>
                                <p className="text-xs text-slate-600">{option.description}</p>
                            </button>
                        ))}
                    </div>
                    
                    {/* Approved Volunteers List */}
                    <div className="mb-6">
                        <h5 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Approved Volunteers ({safeDonation.approvedVolunteers?.length || 0})
                        </h5>
                        
                        {safeDonation.approvedVolunteers && safeDonation.approvedVolunteers.length > 0 ? (
                            <div className="space-y-2">
                                {safeDonation.approvedVolunteers.map((approval, index) => {
                                    // Skip if approval object is invalid
                                    if (!approval || !approval.volunteer) {
                                        return null;
                                    }
                                    
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {approval.volunteer?.name || 'Unknown Volunteer'}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        Rating: {approval.volunteer?.rating || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 text-xs rounded ${approval.status === 'approved' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : approval.status === 'rejected'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {approval.status || 'pending'}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleApproveVolunteer(approval.volunteer._id, 'approved')}
                                                        className="p-1 hover:bg-green-100 rounded transition-colors"
                                                        title="Approve"
                                                    >
                                                        <Check className="h-4 w-4 text-green-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleApproveVolunteer(approval.volunteer._id, 'rejected')}
                                                        className="p-1 hover:bg-red-100 rounded transition-colors"
                                                        title="Reject"
                                                    >
                                                        <X className="h-4 w-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl">
                                <Eye className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500 text-sm">No volunteers approved yet</p>
                                <p className="text-slate-400 text-xs">Volunteers will appear here when they request access</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Information Box */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <h5 className="font-medium text-blue-900 mb-1">Permission Guide</h5>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li><strong>Private:</strong> Only volunteers you approve can see this donation</li>
                                    <li><strong>NGO Managed:</strong> Volunteers must request access, you approve manually</li>
                                    <li><strong>Public:</strong> All volunteers can see and claim this donation immediately</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                    Claimed by: <span className="font-medium">{safeDonation.claimedBy?.name || 'You'}</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPermissions(!showPermissions)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            showPermissions 
                                ? 'bg-slate-600 text-white hover:bg-slate-700' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        {showPermissions ? 'Close Settings' : 'Manage Access'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NGODonationCard;