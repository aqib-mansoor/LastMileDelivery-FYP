import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { TruckIcon, ClockIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline'

function AboutApp() {
    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">About Last Mile Delivery</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Your trusted partner for fast, reliable, and secure last-mile delivery services
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TruckIcon className="h-5 w-5 text-primary" />
                            What We Do
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600 mb-4">
                            Last Mile Delivery (LMD) is a comprehensive delivery platform that connects customers, 
                            vendors, and delivery partners to provide seamless last-mile delivery services.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li>• Fast and reliable delivery services</li>
                            <li>• Real-time order tracking</li>
                            <li>• Multiple vendor partnerships</li>
                            <li>• Secure payment processing</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClockIcon className="h-5 w-5 text-primary" />
                            Our Mission
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">
                            To revolutionize the last-mile delivery experience by providing efficient, 
                            transparent, and customer-centric delivery solutions that connect businesses 
                            and customers seamlessly.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldCheckIcon className="h-5 w-5 text-primary" />
                            Why Choose Us
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Reliability</Badge>
                                <span className="text-sm text-gray-600">99.9% delivery success rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Speed</Badge>
                                <span className="text-sm text-gray-600">Same-day delivery available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Security</Badge>
                                <span className="text-sm text-gray-600">Secure handling of all orders</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Transparency</Badge>
                                <span className="text-sm text-gray-600">Real-time tracking and updates</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserGroupIcon className="h-5 w-5 text-primary" />
                            Our Network
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-primary">500+</div>
                                <div className="text-sm text-gray-600">Partner Vendors</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">1000+</div>
                                <div className="text-sm text-gray-600">Delivery Riders</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">50+</div>
                                <div className="text-sm text-gray-600">Organizations</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-primary">10K+</div>
                                <div className="text-sm text-gray-600">Happy Customers</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                        Simple steps to get your orders delivered
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                                1
                            </div>
                            <h3 className="font-semibold mb-1">Browse & Order</h3>
                            <p className="text-sm text-gray-600">Choose from our partner vendors and place your order</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                                2
                            </div>
                            <h3 className="font-semibold mb-1">Order Processing</h3>
                            <p className="text-sm text-gray-600">Vendor confirms and prepares your order</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                                3
                            </div>
                            <h3 className="font-semibold mb-1">Pickup & Delivery</h3>
                            <p className="text-sm text-gray-600">Our riders pick up and deliver your order</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 text-lg font-bold">
                                4
                            </div>
                            <h3 className="font-semibold mb-1">Enjoy</h3>
                            <p className="text-sm text-gray-600">Receive your order and enjoy!</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold mb-2">Customer Support</h4>
                            <p className="text-sm text-gray-600 mb-1">Email: support@lmddelivery.com</p>
                            <p className="text-sm text-gray-600 mb-1">Phone: +1 (555) 123-4567</p>
                            <p className="text-sm text-gray-600">Hours: 24/7 Support Available</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Business Inquiries</h4>
                            <p className="text-sm text-gray-600 mb-1">Email: business@lmddelivery.com</p>
                            <p className="text-sm text-gray-600 mb-1">Phone: +1 (555) 987-6543</p>
                            <p className="text-sm text-gray-600">Hours: Mon-Fri 9AM-6PM</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AboutApp 