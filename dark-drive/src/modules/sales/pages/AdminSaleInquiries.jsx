import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminSaleInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const[report, setReport] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [replyModalOpen, setReplyModalOpen] = useState(false);
    const[selectedInquiry, setSelectedInquiry] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [replyStatus, setReplyStatus] = useState("ACCEPTED");

    const fetchData = async () => {
        setLoading(true);
        try {
            const [inqRes, repRes] = await Promise.all([
                fetch('http://localhost:8080/api/sales/admin/inquiries'),
                fetch('http://localhost:8080/api/sales/admin/report/trending')
            ]);

            if (!inqRes.ok) throw new Error("Failed to load inquiries");
            if (!repRes.ok) throw new Error("Failed to load analytics");

            setInquiries(await inqRes.json());
            setReport(await repRes.json());
        } catch (error) {
            console.error("Error fetching data:", error);

            alert("System Error: Could not connect to the Sales Server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); },[]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
        const res = await fetch(`http://localhost:8080/api/sales/admin/inquiries/${id}`, { method: 'DELETE' });
        if (res.ok) fetchData();
    };

    const submitReply = async () => {
    //admin reply empty?
        if (replyText.trim() === '') {
            alert("Validation Error: Admin reply message cannot be empty.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/sales/admin/inquiries/${selectedInquiry.inquiryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: replyStatus, adminReply: replyText })
            });
            if (res.ok) {
                alert("Inquiry updated successfully!");
                setReplyModalOpen(false);
                fetchData();
            }
        } catch (error) {
            alert("Network Error while updating.");
        }
    };

    const handleFinalize = async (vehicleId, inquiryId) => {
        if (!window.confirm("FINAL WARNING: This will mark the vehicle as SOLD and remove it from the public showroom. Proceed?")) return;
        const res = await fetch(`http://localhost:8080/api/sales/admin/finalize-sale?vehicleId=${vehicleId}&inquiryId=${inquiryId}`, { method: 'POST' });
        if (res.ok) {
            alert("Sale Finalized Successfully!");
            fetchData();
        }
    };
    // pdf report
    const generatePDF = () => {
        const doc = new jsPDF();


        doc.setFontSize(22);
        doc.setTextColor(22, 24, 28);
        doc.text("Samarasinghe Motors", 14, 22);

        doc.setFontSize(14);
        doc.setTextColor(156, 163, 175);
        doc.text("Trending Vehicles & Inquiry Analytics Report", 14, 30);

        // Add Date & Meta Info
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
        doc.text(`Total Vehicles Tracked: ${report.length}`, 14, 46);

        // Table Data
        const tableColumn =["Rank", "Vehicle ID", "Brand", "Model / Name", "Total Inquiries"];
        const tableRows =[];

        report.forEach((item, index) => {
            const rowData =[
                index + 1,
                `#${item.vehicleId}`,
                item.brand,
                item.name,
                `${item.totalInquiries} Inquiries`
            ];
            tableRows.push(rowData);
        });


        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [22, 24, 28], textColor:[223, 183, 113], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 243, 239] },
            styles: { fontSize: 10, cellPadding: 4 }
        });

        // Save the PDF
        doc.save(`Trending_Vehicles_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const totalInquiriesEver = report.reduce((sum, item) => sum + item.totalInquiries, 0);
    const mostPopularBrand = report.length > 0 ? report[0].brand : 'N/A';

    if (loading) return <div className="bg-[#f5f3ef] min-h-screen p-10 font-sans text-gray-500 font-bold">Loading Dashboard...</div>;

    return (
        <div className="bg-[#f5f3ef] min-h-screen p-6 md:p-10 font-sans">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Sales <span className="text-[#dfb771]">Administration</span></h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Manage inquiries and view vehicle analytics.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Left Side Inquiries List */}
                <div className="lg:w-3/5 space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2">Active Inquiries</h2>

                    {inquiries.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500">No active inquiries.</div>
                    ) : (
                        inquiries.map(inq => (
                            <div key={inq.inquiryId} className="bg-[#16181c] p-6 rounded-2xl shadow-xl flex flex-col md:flex-row gap-6 relative group border border-[#2d323b] hover:border-[#dfb771] transition-colors">

                <span className={`absolute top-4 right-4 text-[10px] font-bold px-3 py-1 rounded-full ${inq.inquiryType === 'BUY_NOW' ? 'bg-blue-600 text-white' : 'bg-[#dfb771] text-black'}`}>
                  {inq.inquiryType.replace('_', ' ')}
                </span>

                                <div className="flex-1 mt-6 md:mt-0">
                                    <p className="text-[#9ca3af] text-xs mb-1">{new Date(inq.createdAt).toLocaleString()}</p>
                                    <h3 className="text-xl font-bold text-white mb-1">{inq.vehicleBrand} {inq.vehicleName}</h3>
                                    <p className="text-[#dfb771] font-bold text-sm mb-4">Rs. {(inq.vehiclePrice / 1000000).toFixed(1)}M</p>

                                    <div className="bg-[#1c1f26] border border-[#2d323b] p-3 rounded-xl mb-4">
                                        <p className="text-[#9ca3af] text-xs font-bold uppercase mb-1">Message from {inq.userName} ({inq.userPhone || 'No Phone'}):</p>
                                        <p className="text-white text-sm">"{inq.message}"</p>
                                    </div>

                                    <p className="text-xs text-gray-400">Current Status: <span className="text-white font-bold">{inq.status}</span></p>
                                    {inq.adminReply && <p className="text-xs text-green-400 mt-1">Your Reply: "{inq.adminReply}"</p>}
                                </div>

                                <div className="flex flex-col gap-2 justify-center w-full md:w-40">
                                    <button onClick={() => { setSelectedInquiry(inq); setReplyStatus("ACCEPTED"); setReplyText(""); setReplyModalOpen(true); }} className="w-full bg-white text-black py-2 rounded-lg text-xs font-bold hover:bg-gray-200">
                                        Reply / Update
                                    </button>
                                    {inq.inquiryType === 'BUY_NOW' && inq.status !== 'SOLD' && (
                                        <button onClick={() => handleFinalize(inq.vehicleId, inq.inquiryId)} className="w-full bg-[#dfb771] text-black py-2 rounded-lg text-xs font-bold hover:bg-[#cda661] shadow-[0_4px_12px_rgba(223,183,113,0.3)]">
                                            Finalize Sale
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(inq.inquiryId)} className="w-full bg-transparent border border-red-500 text-red-500 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white mt-auto">
                                        Delete Record
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* right side analytics*/}
                <div className="lg:w-2/5 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-8">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Analytics Report</h2>
                            <i className="fas fa-chart-line text-[#dfb771] text-2xl"></i>
                        </div>

                        {/* stats grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Total Inquiries</p>
                                <p className="text-2xl font-extrabold text-gray-900">{totalInquiriesEver}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mb-1">Top Brand</p>
                                <p className="text-xl font-extrabold text-[#dfb771] truncate">{mostPopularBrand}</p>
                            </div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-800 mb-4">Top Trending Vehicles</h3>
                        <div className="space-y-3 mb-8">
                            {report.slice(0, 5).map((item, idx) => (
                                <div key={item.vehicleId} className="flex justify-between items-center bg-gray-50 p-3.5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-[#dfb771] text-black' : 'bg-gray-200 text-gray-600'}`}>
                      {idx + 1}
                    </span>
                                        <span className="text-gray-800 font-bold text-sm truncate max-w-[150px]">{item.brand} {item.name}</span>
                                    </div>
                                    <span className="bg-[#16181c] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    {item.totalInquiries} <i className="fas fa-fire text-[#dfb771] ml-1"></i>
                  </span>
                                </div>
                            ))}
                            {report.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No data available.</p>}
                        </div>

                        <button onClick={generatePDF} className="w-full bg-gradient-to-r from-[#16181c] to-[#1c1f26] text-[#dfb771] py-4 rounded-xl text-sm font-bold hover:shadow-lg transition-all flex justify-center items-center gap-3 cursor-pointer">
                            <i className="fas fa-file-pdf text-xl"></i> Generate PDF Report
                        </button>
                    </div>
                </div>

            </div>

            {/* reply*/}
            {replyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-[#16181c] w-full max-w-md rounded-2xl border border-[#2d323b] p-6 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-4">Reply to Inquiry #{selectedInquiry.inquiryId}</h3>

                        <label className="text-[#9ca3af] text-xs font-bold uppercase mb-2 block">Set Status</label>
                        <select value={replyStatus} onChange={(e) => setReplyStatus(e.target.value)} className="w-full bg-[#1c1f26] border border-[#2d323b] rounded-lg p-2.5 text-sm text-white mb-4 outline-none">
                            <option value="PENDING">PENDING</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="REPLIED">REPLIED</option>
                        </select>

                        <label className="text-[#9ca3af] text-xs font-bold uppercase mb-2 block">Admin Message</label>
                        <textarea
                            value={replyText} onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply to the customer..."
                            className="w-full bg-[#1c1f26] border border-[#2d323b] rounded-lg p-3 text-sm text-white outline-none mb-6 resize-none focus:border-[#dfb771]" rows="4"
                        />

                        <div className="flex gap-3">
                            <button onClick={submitReply} className="flex-1 bg-[#dfb771] text-black py-2.5 rounded-xl text-sm font-bold hover:bg-[#cda661]">Update Inquiry</button>
                            <button onClick={() => setReplyModalOpen(false)} className="flex-1 bg-transparent border border-[#2d323b] py-2.5 rounded-xl text-sm text-white hover:bg-[#1c1f26]">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSaleInquiries;