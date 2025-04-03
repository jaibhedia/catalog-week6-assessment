import React from 'react';

const DeployStatus = ({ status, message }) => {
    return (
        <div className={`deploy-status ${status}`}>
            {status === 'success' ? (
                <p className="success-message">{message}</p>
            ) : (
                <p className="error-message">{message}</p>
            )}
        </div>
    );
};

export default DeployStatus;