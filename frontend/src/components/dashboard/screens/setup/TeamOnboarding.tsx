import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaCheckCircle, FaShieldAlt, FaSpinner, FaUpload, FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { onboardingService } from '../../../../services/onboardingService';

interface TeamOnboardingFormData {
    teamName: string;
    teamDescription: string;
    maxUsers: number;
    allowSelfRegistration: boolean;
    requireEmailVerification: boolean;
    defaultUserRole: string;
    allowedDomains: string;
    sessionTimeout: number;
    requireMFA: boolean;
    gdprCompliance: boolean;
    ccpaCompliance: boolean;
    dataRetentionDays: number;
    auditLogging: boolean;
}

interface UserProvisioningData {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    department?: string;
}

export default function TeamOnboarding() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [csvData, setCsvData] = useState<UserProvisioningData[]>([]);
    const [showCsvUpload, setShowCsvUpload] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<TeamOnboardingFormData>({
        defaultValues: {
            maxUsers: 50,
            allowSelfRegistration: true,
            requireEmailVerification: true,
            defaultUserRole: 'user',
            sessionTimeout: 30,
            requireMFA: false,
            gdprCompliance: true,
            ccpaCompliance: false,
            dataRetentionDays: 365,
            auditLogging: true,
        },
    });

    const watchedValues = watch();

    const steps = [
        { id: 1, title: 'Team Setup', description: 'Basic team information' },
        { id: 2, title: 'Security & Compliance', description: 'Configure security settings' },
        { id: 3, title: 'User Provisioning', description: 'Add team members' },
        { id: 4, title: 'Review & Create', description: 'Review and create team' },
    ];

    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const data: UserProvisioningData[] = lines.slice(1)
                .filter(line => line.trim())
                .map(line => {
                    const values = line.split(',').map(v => v.trim());
                    return {
                        email: values[0] || '',
                        firstName: values[1] || '',
                        lastName: values[2] || '',
                        role: values[3] || 'user',
                        department: values[4] || '',
                    };
                });

            setCsvData(data);
        };
        reader.readAsText(file);
    };

    const addManualUser = () => {
        setCsvData([...csvData, {
            email: '',
            firstName: '',
            lastName: '',
            role: 'user',
            department: '',
        }]);
    };

    const removeUser = (index: number) => {
        setCsvData(csvData.filter((_, i) => i !== index));
    };

    const updateUser = (index: number, field: keyof UserProvisioningData, value: string) => {
        const updated = [...csvData];
        updated[index] = { ...updated[index], [field]: value };
        setCsvData(updated);
    };

    const onSubmit = async (data: TeamOnboardingFormData) => {
        setIsSubmitting(true);
        try {
            // Create team with compliance settings
            const teamData = {
                name: data.teamName,
                description: data.teamDescription,
                organizationId: 'current-org-id', // This should come from user context
                settings: {
                    maxUsers: data.maxUsers,
                    allowSelfRegistration: data.allowSelfRegistration,
                    requireEmailVerification: data.requireEmailVerification,
                    defaultUserRole: data.defaultUserRole,
                    allowedDomains: data.allowedDomains.split(',').map(d => d.trim()).filter(Boolean),
                    sessionTimeout: data.sessionTimeout,
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: false,
                        maxAge: 90,
                        preventReuse: 5,
                    },
                    notificationSettings: {
                        emailNotifications: true,
                        smsNotifications: false,
                        pushNotifications: true,
                        notificationChannels: ['email'],
                    },
                },
                complianceSettings: {
                    dataRetentionPolicy: {
                        userDataRetentionDays: data.dataRetentionDays,
                        auditLogRetentionDays: 2555,
                        meetingDataRetentionDays: 2555,
                        autoDeleteEnabled: true,
                        retentionExceptions: [],
                    },
                    auditLogging: {
                        enabled: data.auditLogging,
                        logLevel: 'detailed' as const,
                        logUserActions: true,
                        logSystemEvents: true,
                        logDataAccess: true,
                        retentionPeriod: 2555,
                    },
                    accessControls: {
                        requireMFA: data.requireMFA,
                        sessionTimeout: data.sessionTimeout,
                        ipWhitelist: [],
                        allowedCountries: [],
                        blockSuspiciousActivity: false,
                    },
                    privacySettings: {
                        dataProcessingConsent: true,
                        marketingConsent: false,
                        analyticsConsent: true,
                        cookieConsent: true,
                        gdprCompliance: data.gdprCompliance,
                        ccpaCompliance: data.ccpaCompliance,
                    },
                    regulatoryCompliance: [],
                },
            };

            // Call team onboarding service
            const response = await fetch('/api/v1/teams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(teamData),
            });

            if (!response.ok) {
                throw new Error('Failed to create team');
            }

            const team = await response.json();

            // If users were added, provision them
            if (csvData.length > 0) {
                const userProvisioningData = {
                    teamId: team.data.id,
                    users: csvData.filter(user => user.email && user.firstName && user.lastName),
                };

                const provisioningResponse = await fetch('/api/v1/user-provisioning', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify(userProvisioningData),
                });

                if (!provisioningResponse.ok) {
                    console.warn('Failed to provision users, but team was created successfully');
                }
            }

            // Update onboarding progress
            await onboardingService.updateOnboardingProgress('team_setup', {
                teamId: team.data.id,
                teamName: data.teamName,
                userCount: csvData.length,
                completed_at: new Date().toISOString(),
            });

            // Navigate to next step
            navigate('/setup/integrations');
        } catch (error) {
            console.error('Error creating team:', error);
            alert('Failed to create team. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Team Name *
                                    </label>
                                    <input
                                        {...register('teamName', { required: 'Team name is required' })}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Enter team name"
                                    />
                                    {errors.teamName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.teamName.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Team Description
                                    </label>
                                    <textarea
                                        {...register('teamDescription')}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Describe your team's purpose and goals"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Users
                                    </label>
                                    <input
                                        {...register('maxUsers', {
                                            required: 'Maximum users is required',
                                            min: { value: 1, message: 'Must be at least 1' },
                                            max: { value: 1000, message: 'Cannot exceed 1000' }
                                        })}
                                        type="number"
                                        min="1"
                                        max="1000"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    {errors.maxUsers && (
                                        <p className="text-red-500 text-sm mt-1">{errors.maxUsers.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            {...register('allowSelfRegistration')}
                                            type="checkbox"
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Allow self-registration</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            {...register('requireEmailVerification')}
                                            type="checkbox"
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Require email verification</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security & Compliance</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Default User Role
                                    </label>
                                    <select
                                        {...register('defaultUserRole')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Allowed Email Domains (comma-separated)
                                    </label>
                                    <input
                                        {...register('allowedDomains')}
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="example.com, company.org"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Session Timeout (minutes)
                                    </label>
                                    <input
                                        {...register('sessionTimeout', {
                                            required: 'Session timeout is required',
                                            min: { value: 5, message: 'Must be at least 5 minutes' },
                                            max: { value: 1440, message: 'Cannot exceed 24 hours' }
                                        })}
                                        type="number"
                                        min="5"
                                        max="1440"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    {errors.sessionTimeout && (
                                        <p className="text-red-500 text-sm mt-1">{errors.sessionTimeout.message}</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Security Settings</h4>
                                    <label className="flex items-center">
                                        <input
                                            {...register('requireMFA')}
                                            type="checkbox"
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Require Multi-Factor Authentication</span>
                                    </label>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Compliance Settings</h4>
                                    <label className="flex items-center">
                                        <input
                                            {...register('gdprCompliance')}
                                            type="checkbox"
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">GDPR Compliance</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            {...register('ccpaCompliance')}
                                            type="checkbox"
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">CCPA Compliance</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            {...register('auditLogging')}
                                            type="checkbox"
                                            className="mr-2"
                                        />
                                        <span className="text-sm text-gray-700">Enable Audit Logging</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Data Retention Period (days)
                                    </label>
                                    <input
                                        {...register('dataRetentionDays', {
                                            required: 'Data retention period is required',
                                            min: { value: 30, message: 'Must be at least 30 days' },
                                            max: { value: 2555, message: 'Cannot exceed 7 years' }
                                        })}
                                        type="number"
                                        min="30"
                                        max="2555"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    {errors.dataRetentionDays && (
                                        <p className="text-red-500 text-sm mt-1">{errors.dataRetentionDays.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Provisioning</h3>

                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCsvUpload(!showCsvUpload)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    <FaUpload />
                                    <span>Upload CSV File</span>
                                </button>

                                {showCsvUpload && (
                                    <div className="mt-4 p-4 border border-gray-300 rounded-md">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCsvUpload}
                                            className="mb-2"
                                        />
                                        <p className="text-sm text-gray-600">
                                            CSV format: email, firstName, lastName, role, department
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <button
                                    type="button"
                                    onClick={addManualUser}
                                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    <FaUsers />
                                    <span>Add User Manually</span>
                                </button>
                            </div>

                            {csvData.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Team Members ({csvData.length})</h4>
                                    {csvData.map((user, index) => (
                                        <div key={index} className="p-4 border border-gray-300 rounded-md">
                                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={user.email}
                                                    onChange={(e) => updateUser(index, 'email', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={user.firstName}
                                                    onChange={(e) => updateUser(index, 'firstName', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={user.lastName}
                                                    onChange={(e) => updateUser(index, 'lastName', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                />
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateUser(index, 'role', e.target.value)}
                                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="manager">Manager</option>
                                                </select>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Department"
                                                        value={user.department || ''}
                                                        onChange={(e) => updateUser(index, 'department', e.target.value)}
                                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeUser(index)}
                                                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {csvData.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <FaUsers className="mx-auto text-4xl mb-4" />
                                    <p>No team members added yet.</p>
                                    <p className="text-sm">Upload a CSV file or add users manually.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review & Create Team</h3>

                            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Team Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Name:</span> {watchedValues.teamName}</p>
                                        <p><span className="font-medium">Description:</span> {watchedValues.teamDescription || 'No description'}</p>
                                        <p><span className="font-medium">Max Users:</span> {watchedValues.maxUsers}</p>
                                        <p><span className="font-medium">Self Registration:</span> {watchedValues.allowSelfRegistration ? 'Enabled' : 'Disabled'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Security Settings</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">Default Role:</span> {watchedValues.defaultUserRole}</p>
                                        <p><span className="font-medium">Session Timeout:</span> {watchedValues.sessionTimeout} minutes</p>
                                        <p><span className="font-medium">MFA Required:</span> {watchedValues.requireMFA ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Compliance Settings</h4>
                                    <div className="space-y-1 text-sm">
                                        <p><span className="font-medium">GDPR Compliance:</span> {watchedValues.gdprCompliance ? 'Enabled' : 'Disabled'}</p>
                                        <p><span className="font-medium">CCPA Compliance:</span> {watchedValues.ccpaCompliance ? 'Enabled' : 'Disabled'}</p>
                                        <p><span className="font-medium">Audit Logging:</span> {watchedValues.auditLogging ? 'Enabled' : 'Disabled'}</p>
                                        <p><span className="font-medium">Data Retention:</span> {watchedValues.dataRetentionDays} days</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Team Members</h4>
                                    <p className="text-sm">{csvData.length} members will be added</p>
                                    {csvData.length > 0 && (
                                        <div className="mt-2 max-h-32 overflow-y-auto">
                                            {csvData.map((user, index) => (
                                                <p key={index} className="text-xs text-gray-600">
                                                    {user.email} ({user.firstName} {user.lastName}) - {user.role}
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= step.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-300 text-gray-600'
                                }`}>
                                {currentStep > step.id ? (
                                    <FaCheckCircle className="w-4 h-4" />
                                ) : (
                                    <span className="text-sm font-medium">{step.id}</span>
                                )}
                            </div>
                            <div className="ml-3">
                                <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-purple-600' : 'text-gray-500'
                                    }`}>
                                    {step.title}
                                </p>
                                <p className="text-xs text-gray-500">{step.description}</p>
                            </div>
                            {index < steps.length - 1 && (
                                <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? 'bg-purple-600' : 'bg-gray-300'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    {renderStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>

                    <div className="flex space-x-3">
                        {currentStep < steps.length ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <FaSpinner className="animate-spin" />
                                        <span>Creating Team...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaShieldAlt />
                                        <span>Create Team</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
