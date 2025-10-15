import { CalendarIcon, CheckIcon, CreditCardIcon, DownloadIcon } from "lucide-react";

export default function BillingSettings () {
    return (
        <>
        <p className='text-gray-600'>Manage your subscription, payment methods, and billing history</p>
        <section className='xui-p-1 xui-md-p-1-half xui-bdr-w-1 xui-bg-light-blue-1 xui-bdr-blue xui-bdr-s-solid xui-bdr-rad-half xui-mt-1'>
            <div className="xui-d-flex xui-flex-ai-center xui-flex-jc-space-between">
                <div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <p className="text-[16px]">Max Plan </p>
                        <span className="xui-badge xui-bg-black xui-bdr-rad-5 xui-text-white">Current Plan</span>
                    </div>
                    <h4 className="xui-opacity-6 xui-mt-half text-[16px]">$49/month</h4>
                </div>
                <button className="xui-btn xui-btn-white xui-bdr-rad-half">
                    <span className="text-[13px]">Change Plan</span>
                </button>
            </div>
            <div className="xui-mt-2 xui-d-grid xui-grid-col-1 xui-md-grid-col-3">
                <div className="xui-d-grid xui-grid-col-1 xui-grid-gap-1">
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Unlimited meetings</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Priority support</span>
                    </div>
                </div>
                <div className="xui-d-grid xui-grid-col-1 xui-grid-gap-1">
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">500GB storage</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Advanced analytics</span>
                    </div>
                </div>
                <div className="xui-d-grid xui-grid-col-1 xui-grid-gap-1">
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">All integrations</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Custom workflows</span>
                    </div>
                </div>
            </div>
            <div className="xui-mt-3 xui-opacity-8 xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                <CalendarIcon size={16} />
                <span className="text-[14px]">Renews on November 11, 2025</span>
            </div>
        </section>
        <h4 className="text-[16px] xui-font-w-600 xui-mt-2">Usage This Month</h4>
        <section className='xui-mt-1 xui-d-grid xui-grid-col-1 xui-md-grid-col-3 xui-grid-gap-1'>
            <div className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
                <span className='text-[14px] xui-opacity-6'>Meetings</span>
                <h1 className='text-[32px] xui-font-w-700 xui-mt-1'>127</h1>
                <div className="qylon-progress-container xui-mt-1">
                    <div className="qylon-progress-bar xui-bg-black" style={{
                        width: '60%'
                    }}></div>
                </div>
                <span className='text-[14px] xui-opacity-6 xui-mt-1 xui-d-inline-block'>of 200</span>
            </div>
            <div className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
                <span className='text-[14px] xui-opacity-6'>Storage Used</span>
                <h1 className='text-[32px] xui-font-w-700 xui-mt-1'>142 GB</h1>
                <div className="qylon-progress-container xui-mt-1">
                    <div className="qylon-progress-bar xui-bg-black" style={{
                        width: '40%'
                    }}></div>
                </div>
                <span className='text-[14px] xui-opacity-6 xui-mt-1 xui-d-inline-block'>500 GB available</span>
            </div>
            <div className='xui-p-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
                <span className='text-[14px] xui-opacity-6'>API Calls</span>
                <h1 className='text-[32px] xui-font-w-700 xui-mt-1'>4,523</h1>
                <div className="qylon-progress-container xui-mt-1">
                    <div className="qylon-progress-bar xui-bg-black" style={{
                        width: '40%'
                    }}></div>
                </div>
                <span className='text-[14px] xui-opacity-6 xui-mt-1 xui-d-inline-block'>10,000 limit</span>
            </div>
        </section>
        <section className='xui-p-1 xui-mt-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
            <h4 className="text-[16px] xui-font-w-600">Payment Method</h4>
            <div className='xui-p-1 xui-mt-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className="xui-d-inline-flex xui-flex-ai-center xui-grid-gap-half">
                    <div className="xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-w-40 xui-h-40 xui-bdr-rad-half xui-bg-light">
                        <CreditCardIcon size={24} />
                    </div>
                    <div className="xui-d-inline-flex xui-flex-dir-column">
                        <p>Visa ending in 4242</p>
                        <span className="xui-opacity-6 text-[12px]">Expires 12/2027</span>
                    </div>
                </div>
                <button className="xui-btn xui-bdr-rad-half">
                    <span className="text-[13px]">Update</span>
                </button>
            </div>
            <div className="xui-mt-2 xui-bg-light xui-p-1 xui-bdr-rad-half">
                <h5 className="xui-opacity-9">Billing Address</h5>
                <span className="xui-opacity-6 xui-mt-half text-[14px] xui-d-inline-block w-[200px]">123 Main Street New York, NY 10001 United States</span>
            </div>
        </section>
        <h4 className="text-[16px] xui-font-w-600 xui-mt-2">Compare Plans</h4>
        <div className="xui-d-grid xui-grid-col-1 xui-lg-grid-col-3 xui-grid-gap-1 xui-mt-1">
            <div className="xui-p-1 xui-md-p-1-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-bdr-rad-half">
                <span className="text-[16px] xui-font-w-600">Standard</span>
                <p className="text-[14px] xui-opacity-6 xui-mt-half">Perfect for individuals</p>
                <h1 className='text-[32px] xui-font-w-700 xui-mt-1-half'>$19<span className="text-[16px] xui-opacity-5 xui-font-w-500">/month</span></h1>
                <div className="xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-1">
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">50 meetings/month</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">100GB storage</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Basic integrations</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Email support</span>
                    </div>
                </div>
                <button className="xui-btn xui-btn-block xui-bdr-rad-half xui-mt-4">
                    <span>Switch to Standard</span>
                </button>
            </div>
            <div className="xui-p-1 xui-md-p-1-half xui-bdr-black xui-bdr-w-2 xui-position-relative xui-bdr-s-solid xui-bdr-rad-half">
                <span style={{
                    top: '8px',
                    right: '8px'
                }} className="xui-position-absolute xui-badge xui-bg-black xui-text-white">Recommended</span>
                <span className="text-[16px] xui-font-w-600">Standard</span>
                <p className="text-[14px] xui-opacity-6 xui-mt-half">Perfect for individuals</p>
                <h1 className='text-[32px] xui-font-w-700 xui-mt-1-half'>$49<span className="text-[16px] xui-opacity-5 xui-font-w-500">/month</span></h1>
                <div className="xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-1">
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">50 meetings/month</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">100GB storage</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Basic integrations</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Email support</span>
                    </div>
                </div>
                <button className="xui-btn xui-btn-block xui-btn-black xui-bdr-rad-half xui-mt-4">
                    <span>Current Plan</span>
                </button>
            </div>
            <div className="xui-p-1 xui-md-p-1-half xui-bdr-fade xui-bdr-w-1 xui-bdr-s-solid xui-bdr-rad-half">
                <span className="text-[16px] xui-font-w-600">Enterprise</span>
                <p className="text-[14px] xui-opacity-6 xui-mt-half">For large organizations</p>
                <h1 className='text-[32px] xui-font-w-700 xui-mt-1-half'>Custom</h1>
                <div className="xui-mt-2 xui-d-grid xui-grid-col-1 xui-grid-gap-1">
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">50 meetings/month</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">100GB storage</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Basic integrations</span>
                    </div>
                    <div className="xui-d-inline-flex xui-grid-gap-half xui-flex-ai-center">
                        <CheckIcon color="#00A63E" size={16} />
                        <span className="xui-opacity-7 text-[14px]">Email support</span>
                    </div>
                </div>
                <button className="xui-btn xui-btn-block xui-bdr-rad-half xui-mt-4">
                    <span>Switch to Enterprise</span>
                </button>
            </div>
        </div>
        <section className='xui-p-1 xui-mt-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half'>
            <h4 className="text-[16px] xui-font-w-600">Billing History</h4>
            <div className='xui-p-1 xui-mt-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className="xui-d-inline-flex xui-flex-ai-center xui-grid-gap-half">
                    <div className="xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-w-40 xui-h-40 xui-bdr-rad-half xui-bg-light">
                        <DownloadIcon size={20} />
                    </div>
                    <div className="xui-d-inline-flex xui-flex-dir-column">
                        <p>October 11, 2025</p>
                        <span className="xui-opacity-6 text-[12px]">$49.00</span>
                    </div>
                </div>
                <div className="xui-d-inline-flex xui-grid-gap-1 xui-flex-ai-center">
                    <span className="xui-badge xui-badge-success">paid</span>
                    <div className="xui-bg-light xui-bdr-rad-half xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-w-20 xui-h-20">
                        <DownloadIcon size={20} />
                    </div>
                </div>
            </div>
            <div className='xui-p-1 xui-mt-1 xui-bdr-w-1 xui-bdr-fade xui-bdr-s-solid xui-bdr-rad-half xui-d-flex xui-flex-ai-center xui-flex-jc-space-between'>
                <div className="xui-d-inline-flex xui-flex-ai-center xui-grid-gap-half">
                    <div className="xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-w-40 xui-h-40 xui-bdr-rad-half xui-bg-light">
                        <DownloadIcon size={20} />
                    </div>
                    <div className="xui-d-inline-flex xui-flex-dir-column">
                        <p>October 11, 2025</p>
                        <span className="xui-opacity-6 text-[12px]">$49.00</span>
                    </div>
                </div>
                <div className="xui-d-inline-flex xui-grid-gap-1 xui-flex-ai-center">
                    <span className="xui-badge xui-badge-success">paid</span>
                    <div className="xui-bg-light xui-bdr-rad-half xui-d-inline-flex xui-flex-ai-center xui-flex-jc-center xui-w-20 xui-h-20">
                        <DownloadIcon size={20} />
                    </div>
                </div>
            </div>
        </section>
        </>
    );
}
