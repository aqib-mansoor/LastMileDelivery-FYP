import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { DocumentTextIcon, ExclamationTriangleIcon, CurrencyDollarIcon, TruckIcon } from '@heroicons/react/24/outline'

function TermsOfConditions() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Conditions</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-primary" />
                        Agreement to Terms
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        By accessing and using Last Mile Delivery (LMD) services, you agree to be bound by these Terms of Conditions. 
                        If you do not agree to these terms, please do not use our services. These terms constitute a legally binding 
                        agreement between you and LMD.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Definitions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <h4 className="font-semibold">"Service"</h4>
                            <p className="text-sm text-gray-600">Refers to the Last Mile Delivery platform and all related services</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">"User"</h4>
                            <p className="text-sm text-gray-600">Any person who accesses or uses our services, including customers, vendors, and riders</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">"Platform"</h4>
                            <p className="text-sm text-gray-600">The LMD mobile application and web platform</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">"Content"</h4>
                            <p className="text-sm text-gray-600">All information, data, text, images, and other materials available through our service</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Eligibility</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-gray-600">To use our services, you must:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            <li>Be at least 18 years old or have parental consent</li>
                            <li>Have the legal capacity to enter into binding agreements</li>
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the security of your account credentials</li>
                            <li>Comply with all applicable laws and regulations</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>User Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Account Registration</h4>
                            <p className="text-sm text-gray-600 mb-2">
                                You must create an account to use our services. You agree to:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and update your information as needed</li>
                                <li>Keep your login credentials secure and confidential</li>
                                <li>Notify us immediately of any unauthorized access</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold">Account Responsibility</h4>
                            <p className="text-sm text-gray-600">
                                You are responsible for all activities that occur under your account. We are not liable for any 
                                loss or damage resulting from unauthorized use of your account.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TruckIcon className="h-5 w-5 text-primary" />
                        Delivery Services
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Service Availability</h4>
                            <p className="text-sm text-gray-600">
                                Our delivery services are subject to availability in your area. Delivery times are estimates 
                                and may vary based on various factors including weather, traffic, and vendor preparation time.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Order Accuracy</h4>
                            <p className="text-sm text-gray-600">
                                While we strive for accuracy, we are not responsible for errors in orders placed by customers 
                                or prepared by vendors. Please review your order carefully before placing it.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Delivery Acceptance</h4>
                            <p className="text-sm text-gray-600">
                                By accepting delivery, you confirm that the order has been received in satisfactory condition. 
                                Any issues should be reported immediately through our platform.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CurrencyDollarIcon className="h-5 w-5 text-primary" />
                        Payment Terms
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Payment Processing</h4>
                            <p className="text-sm text-gray-600">
                                All payments are processed through secure third-party payment processors. You agree to pay all 
                                charges associated with your orders, including applicable taxes and fees.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Pricing</h4>
                            <p className="text-sm text-gray-600">
                                Prices are set by individual vendors and are subject to change without notice. The price 
                                displayed at the time of order placement is the price you will be charged.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Refunds and Cancellations</h4>
                            <p className="text-sm text-gray-600">
                                Refund and cancellation policies vary by vendor. Please review the specific policy for each 
                                vendor before placing an order. LMD may facilitate refunds but is not responsible for vendor policies.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>User Conduct</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-gray-600">You agree not to:</p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            <li>Use the service for any unlawful purpose or in violation of these terms</li>
                            <li>Harass, abuse, or harm other users, vendors, or delivery personnel</li>
                            <li>Provide false or misleading information</li>
                            <li>Interfere with the proper functioning of the platform</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Use the service to transmit spam, viruses, or malicious content</li>
                            <li>Violate any applicable laws or regulations</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Intellectual Property</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Platform Rights</h4>
                            <p className="text-sm text-gray-600">
                                All content, features, and functionality of the LMD platform are owned by us or our licensors 
                                and are protected by intellectual property laws.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">User Content</h4>
                            <p className="text-sm text-gray-600">
                                By submitting content to our platform (reviews, photos, etc.), you grant us a non-exclusive, 
                                royalty-free license to use, modify, and display such content for service-related purposes.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Restrictions</h4>
                            <p className="text-sm text-gray-600">
                                You may not copy, modify, distribute, or create derivative works from our platform without 
                                express written permission.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-primary" />
                        Disclaimers and Limitations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold">Service Availability</h4>
                            <p className="text-sm text-gray-600">
                                We provide our services "as is" and "as available." We do not guarantee uninterrupted or 
                                error-free service and may suspend or terminate services at any time.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Third-Party Vendors</h4>
                            <p className="text-sm text-gray-600">
                                LMD acts as an intermediary between customers and vendors. We are not responsible for the 
                                quality, safety, or legality of products offered by vendors.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Limitation of Liability</h4>
                            <p className="text-sm text-gray-600">
                                To the maximum extent permitted by law, LMD shall not be liable for any indirect, incidental, 
                                special, or consequential damages arising from your use of our services.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Termination</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-gray-600">
                            Either party may terminate this agreement at any time. We may suspend or terminate your account if you:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                            <li>Violate these terms of conditions</li>
                            <li>Engage in fraudulent or illegal activities</li>
                            <li>Abuse our platform or other users</li>
                            <li>Fail to pay outstanding charges</li>
                        </ul>
                        <p className="text-sm text-gray-600 mt-3">
                            Upon termination, your right to use our services will cease immediately, but these terms will 
                            continue to apply to any prior use of our services.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Changes to Terms</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        We reserve the right to modify these terms at any time. We will provide notice of material changes 
                        through our platform or via email. Your continued use of our services after such changes constitutes 
                        acceptance of the new terms.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600 mb-3">
                        If you have any questions about these Terms of Conditions, please contact us:
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>Email:</strong> legal@lmddelivery.com</p>
                        <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                        <p><strong>Address:</strong> 123 Legal Street, Terms City, TC 12345</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TermsOfConditions 