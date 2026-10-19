import { useState } from "react";
import React from 'react';
import { assets, categories } from "../../assets/assets";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddProduct = () => {
    const [files, setFiles] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [offerPrice, setOfferPrice] = useState('');
    
    // New states for colors and sizes
    const [colors, setColors] = useState([]);
    const [colorInput, setColorInput] = useState('');
    const [sizes, setSizes] = useState([]);

    const { axios } = useAppContext();

    const availableSizes = ["S", "M", "L", "XL", "XXL", "38", "40", "42"];

    // Handle color adding
    const addColor = (e) => {
        if (e.key === 'Enter' && colorInput.trim() !== '') {
            e.preventDefault();
            if (!colors.includes(colorInput.trim())) {
                setColors([...colors, colorInput.trim()]);
            }
            setColorInput('');
        }
    };

    const removeColor = (indexToRemove) => {
        setColors(colors.filter((_, index) => index !== indexToRemove));
    };

    // Handle size toggle
    const toggleSize = (size) => {
        setSizes(prev => 
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            const productData = {
                name,
                description,
                category,
                price: Number(price),
                offerPrice: Number(offerPrice),
                colors, // Added to payload
                sizes,  // Added to payload
            }

            const formData = new FormData();
            formData.append('productData', JSON.stringify(productData));
            
            files.forEach((file) => {
                if(file) formData.append('images', file);
            });

            const { data } = await axios.post('/api/product/add', formData)

            if (data.success) {
                toast.success(data.message);
                // Reset fields
                setName('');
                setDescription('');
                setCategory('');
                setPrice('');
                setOfferPrice('');
                setFiles([]);
                setColors([]);
                setSizes([]);
            } else {
                console.error("Error adding product:", data.message);
                toast.error(data.message);
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("An unexpected error occurred")
        }
    }

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-6 max-w-lg">
                
                {/* Image Upload Section (Existing) */}
                <div>
                    <p className="text-base font-medium mb-2">Product Image</p>
                    <div className="flex flex-wrap items-center gap-3">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>
                                <input 
                                    onChange={(e) => {
                                        const updatedFiles = [...files];
                                        updatedFiles[index] = e.target.files[0];
                                        setFiles(updatedFiles);
                                    }}
                                    accept="image/*" type="file" id={`image${index}`} hidden 
                                />
                                <img className="w-24 h-24 object-cover border rounded cursor-pointer" 
                                     src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} 
                                     alt="" />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Name & Description (Existing) */}
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Product Name</label>
                    <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Type here" className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                </div>

                <div className="flex flex-col gap-1 max-w-md">
                    <label
                    className="text-base font-medium" htmlFor="product-description">
                        Product Description 
                    </label>
                    <textarea 
                    onChange={(e)=> setDescription(e.target.value)} value={description}
                    id="product-description" rows={4} 
                    className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none" 
                    placeholder="Type here"></textarea>
                </div>

                {/* Colors Section (Type to add) */}
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Product Colors (Press Enter to add)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {colors.map((color, index) => (
                            <span key={index} className="bg-primary text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                {color}
                                <button type="button" onClick={() => removeColor(index)} className="font-bold">×</button>
                            </span>
                        ))}
                    </div>
                    <input 
                        value={colorInput}
                        onChange={(e) => setColorInput(e.target.value)}
                        onKeyDown={addColor}
                        type="text" 
                        placeholder="Add color and press enter" 
                        className="outline-none py-2 px-3 rounded border border-gray-500/40" 
                    />
                </div>

                {/* Sizes Section (Multi-select) */}
                <div className="flex flex-col gap-1">
                    <p className="text-base font-medium">Product Sizes</p>
                    <div className="flex flex-wrap gap-3 mt-2">
                        {availableSizes.map((size) => (
                            <div 
                                key={size} 
                                onClick={() => toggleSize(size)}
                                className={`px-4 py-2 border rounded cursor-pointer transition-all ${sizes.includes(size) ? 'bg-primary text-white border-primary' : 'bg-gray-100 border-gray-300'}`}
                            >
                                {size}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category & Pricing (Existing) */}
                <div className="flex flex-col gap-1">
                    <label className="text-base font-medium">Category</label>
                    <select onChange={(e) => setCategory(e.target.value)} value={category} className="outline-none py-2 px-3 rounded border border-gray-500/40">
                        <option value="">Select Category</option>
                        {categories.map((item, index) => (
                            <option key={index} value={item.path}>{item.path}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-base font-medium">Price</label>
                        <input onChange={(e) => setPrice(e.target.value)} value={price} type="number" placeholder="0" className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-base font-medium">Offer Price</label>
                        <input onChange={(e) => setOfferPrice(e.target.value)} value={offerPrice} type="number" placeholder="0" className="outline-none py-2 px-3 rounded border border-gray-500/40" required />
                    </div>
                </div>

                <button type="submit" className="w-full py-3 bg-primary text-white font-medium rounded hover:bg-opacity-90 transition-all">
                    ADD PRODUCT
                </button>
            </form>
        </div>
    );
};

export default AddProduct;