import React, { useState } from 'react';
import apiFetch from '../../services/api';

function ProfileUpdate({ user, onUpdateSuccess, showMessage }) {
    const [formData, setFormData] = useState({
        fullName: user.fullName || '',
        phone: user.phone || '',
        password: '',
        licenseUrl: user.licenseUrl || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await apiFetch(`/api/users/${user.userId}/customer`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                // Update local storage to keep session in sync
                const storedUser = JSON.parse(localStorage.getItem('user'));
                const newUser = { ...storedUser, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(newUser));
                
                showMessage("Profile updated successfully!");
                onUpdateSuccess(newUser);
            } else {
                const errorText = await response.text();
                showMessage(errorText || "Failed to update profile", true);
            }
        } catch {
            showMessage("Network error. Please try again.", true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-update-container">
            <div className="section-header">
                <h2><svg viewBox="0 0 24 24" fill="none" stroke="#c9a052" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: 20, height: 20, marginRight: 8, verticalAlign: 'middle'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Personal Information</h2>
            </div>
            
            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            name="fullName" 
                            value={formData.fullName} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input 
                            type="text" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Email (Account ID)</label>
                        <input type="text" value={user.email} disabled className="disabled-input" />
                        <small>Email cannot be changed.</small>
                    </div>
                    <div className="form-group">
                        <label>NIC</label>
                        <input type="text" value={user.nic} disabled className="disabled-input" />
                        <small>Contact Admin to update NIC.</small>
                    </div>
                    <div className="form-group">
                        <label>Driving License URL</label>
                        <input 
                            type="text" 
                            name="licenseUrl" 
                            value={formData.licenseUrl} 
                            onChange={handleChange} 
                            placeholder="https://link-to-your-license-image"
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password} 
                            onChange={handleChange} 
                            placeholder="Leave blank to keep current"
                        />
                    </div>
                </div>
                
                <div className="form-actions" style={{marginTop: 30}}>
                    <button type="submit" className="action-btn success" disabled={loading} style={{maxWidth: 200}}>
                        {loading ? "Updating..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ProfileUpdate;
