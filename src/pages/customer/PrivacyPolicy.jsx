import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { ShieldCheckIcon, EyeIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline'

function PrivacyPolicy() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheckIcon className="h-5 w-5 text-primary" />
                        Our Commitment to Privacy
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        At Last Mile Delivery (LMD), we are committed to protecting your privacy and personal information. 
                        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
                        use our delivery platform and services.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary" />
                        Information We Collect
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2">Personal Information</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                <li>Name, email address, and phone number</li>
                                <li>Delivery addresses and location data</li>
                                <li>Payment information (processed securely through third-party providers)</li>
                                <li>Profile pictures and preferences</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Usage Information</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                <li>Order history and preferences</li>
                                <li>App usage patterns and interactions</li>
                                <li>Device information and IP addresses</li>
                                <li>Location data for delivery purposes</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Communication Data</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                <li>Messages between customers, vendors, and riders</li>
                                <li>Customer support communications</li>
                                <li>Feedback and reviews</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <EyeIcon className="h-5 w-5 text-primary" />
                        How We Use Your Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-semibold">Service Delivery</h4>
                                <p className="text-sm text-gray-600">Process orders, coordinate deliveries, and facilitate communication between parties</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-semibold">Account Management</h4>
                                <p className="text-sm text-gray-600">Create and maintain your account, authenticate users, and provide customer support</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-semibold">Communication</h4>
                                <p className="text-sm text-gray-600">Send order updates, notifications, and promotional messages (with your consent)</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-semibold">Service Improvement</h4>
                                <p className="text-sm text-gray-600">Analyze usage patterns to improve our platform and develop new features</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                            <div>
                                <h4 className="font-semibold">Legal Compliance</h4>
                                <p className="text-sm text-gray-600">Comply with legal obligations and protect against fraud or misuse</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Information Sharing</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
                        </p>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold">Service Providers</h4>
                                <p className="text-sm text-gray-600">With vendors and delivery partners to fulfill your orders</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Third-Party Services</h4>
                                <p className="text-sm text-gray-600">With payment processors, mapping services, and analytics providers</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Legal Requirements</h4>
                                <p className="text-sm text-gray-600">When required by law or to protect our rights and safety</p>
                            </div>
                            <div>
                                <h4 className="font-semibold">Business Transfers</h4>
                                <p className="text-sm text-gray-600">In connection with mergers, acquisitions, or asset sales</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Security</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-gray-600">
                            We implement appropriate technical and organizational security measures to protect your personal information:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security audits and vulnerability assessments</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Secure payment processing through certified providers</li>
                            <li>Regular staff training on data protection practices</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="h-5 w-5 text-primary" />
                        Your Rights and Choices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold">Access and Update</h4>
                            <p className="text-sm text-gray-600">You can access and update your personal information through your account settings</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Data Portability</h4>
                            <p className="text-sm text-gray-600">Request a copy of your personal data in a structured, machine-readable format</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Deletion</h4>
                            <p className="text-sm text-gray-600">Request deletion of your account and associated personal data</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Marketing Communications</h4>
                            <p className="text-sm text-gray-600">Opt out of promotional emails and notifications at any time</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Location Data</h4>
                            <p className="text-sm text-gray-600">Control location sharing through your device settings</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cookies and Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-gray-600">
                            We use cookies and similar tracking technologies to enhance your experience:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            <li>Essential cookies for platform functionality</li>
                            <li>Analytics cookies to understand usage patterns</li>
                            <li>Preference cookies to remember your settings</li>
                            <li>Marketing cookies for personalized content (with consent)</li>
                        </ul>
                        <p className="text-sm text-gray-600 mt-3">
                            You can manage cookie preferences through your browser settings.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Data Retention</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-3">
                        We retain your personal information for as long as necessary to provide our services and comply with legal obligations:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                        <li>Account information: Until account deletion</li>
                        <li>Order history: 7 years for tax and legal compliance</li>
                        <li>Communication records: 3 years</li>
                        <li>Analytics data: 2 years in aggregated form</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Children's Privacy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        Our services are not intended for children under 13 years of age. We do not knowingly collect 
                        personal information from children under 13. If you believe we have collected information from 
                        a child under 13, please contact us immediately.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Changes to This Policy</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        We may update this Privacy Policy from time to time. We will notify you of any material changes 
                        by posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued 
                        use of our services after any changes constitutes acceptance of the updated policy.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Us</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-3">
                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Email:</strong> privacy@lmddelivery.com</p>
                        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                        <p><strong>Address:</strong> 123 Privacy Street, Data City, DC 12345</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PrivacyPolicy 