import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import {postNewAd, getAllCategories, getAllSubCategories} from "../../Services/api";

export default function PostAdForm() {
  const { category, subcategory } = useParams();
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [images, setImages] = useState([]);
  const [imageError, setImageError] = useState("");

  // Fetch categories and subcategories on component mount
  useEffect(() => {
    async function fetchData() {
      const catRes = await getAllCategories();
      setCategories(catRes?.data?.categories || []);
      const subRes = await getAllSubCategories();
      setSubcategories(subRes?.data?.subcategories || []);
    }
    fetchData();
  }, []);

  // Watch for subSubCategory selection
  const watchedTvSubType = watch("tvSubType");


  // Handle image upload
  const handleImageChange = (e) => {
    setImageError("");
    const files = Array.from(e.target.files);
    const allowedExtensions = ["png", "jpg", "jpeg"];

    for (let file of files) {
      const extension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(extension)) {
        setImageError("Only .png, .jpg, and .jpeg formats are allowed");
        return; // Stop processing if invalid file found
      }
    }
    if (images.length + files.length > 5) {
      setImageError("You can upload up to 5 images only.");
      return;
    }
    setImages([...images, ...files]);
  };

  // Optionally: Remove image
  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
  const token = sessionStorage.getItem("token");
  try {
    const formData = new FormData();

    // Basic fields
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("price", data.price || "");
    formData.append("priceType", data.priceType || "Fixed");
    formData.append("termsAccepted", data.termsAccepted ? "true" : "false");

    // Use category/subcategory IDs if available
    // Example mapping (replace with your actual mapping logic)
const categoryId = categories.find(cat => cat.name === category)?._id;
const subcategoryId = subcategories.find(sub => sub.name === subcategory)?._id;

formData.append("category", categoryId);
formData.append("subcategory", subcategoryId);

    // Seller (optional)
    if (data.seller) formData.append("seller", data.seller);

    // Location fields (bracket notation)
    formData.append("location[city]", data.city || "");
    formData.append("location[state]", data.state || "");
    formData.append("location[pincode]", data.pincode || "");
    formData.append("location[address]", data.address || "");

    // Contact info fields (bracket notation)
    formData.append("contactInfo[name]", data.name || "");
    formData.append("contactInfo[phone]", data.phone || "");
    formData.append("contactInfo[email]", data.email || "");

    // Category-specific fields
    if (category === "Mobiles") {
      formData.append("categorySpecific[brand]", data.brand || "");
      formData.append("categorySpecific[model]", data.model || "");
      formData.append("categorySpecific[ram]", data.ram || "");
      formData.append("categorySpecific[storage]", data.storage || "");
      formData.append("categorySpecific[condition]", data.condition || "");
      if (data.color) formData.append("categorySpecific[color]", data.color);
      if (data.features) {
      data.features.split(',').map(f => f.trim()).filter(Boolean).forEach(f =>
      formData.append('categorySpecific[features][]', f)
      );
    }}
    if (category === "Furniture") {
      formData.append("categorySpecific[type]", data.type || "");
      formData.append("categorySpecific[features]", data.features || "");
      formData.append("categorySpecific[includes]", data.includes || "");
      formData.append("categorySpecific[condition]", data.condition || "");
      formData.append("categorySpecific[furnitureMaterial]", data.furnitureMaterial || "");
    }

    if (category === "Vehicles") {
      formData.append("categorySpecific[brand]", data.brand || "");
      formData.append("categorySpecific[year]", data.year || "");
      formData.append("categorySpecific[kmDriven]", data.kmDriven || "");

     // Only append these fields if NOT "Spare Parts"
    if (subcategory !== "Spare Parts") {
    if (data.fuelType) formData.append("categorySpecific[fuelType]", data.fuelType);
    if (data.transmission) formData.append("categorySpecific[transmission]", data.transmission);
    if (data.owner) formData.append("categorySpecific[owner]", data.owner);
    if (data.condition) formData.append("categorySpecific[condition]", data.condition);
  }
}

    if (category === "Real Estate") {
      formData.append("categorySpecific[type]", data.type || "");
      formData.append("categorySpecific[bhk]", data.bhk || "");
      formData.append("categorySpecific[area]", data.area || "");
      formData.append("categorySpecific[furnishing]", data.furnishing || "");
      formData.append("categorySpecific[bedrooms]", data.bedrooms || "");
      formData.append("categorySpecific[bathrooms]", data.bathrooms || "");
    }

    if (category === "Jobs") {
      formData.append("categorySpecific[jobType]", data.jobType || "");
      formData.append("categorySpecific[experience]", data.experience || "");
      formData.append("categorySpecific[salaryRange]", data.salaryRange || "");
      formData.append("categorySpecific[role]", data.role || "");
    }

    if (category === "Services") {
      formData.append("categorySpecific[serviceType]", data.serviceType || "");
      formData.append("categorySpecific[availableTimings]", data.availableTimings || "");
      formData.append("categorySpecific[charges]", data.charges || "");
    }

    if (category === "Pets") {
      formData.append("categorySpecific[breed]", data.breed || "");
      formData.append("categorySpecific[age]", data.age || "");
      formData.append("categorySpecific[vaccinationStatus]", data.vaccinationStatus || "");
    }

    // Electronics & Appliances subcategories
    if (category === "Electronics & Appliances") {
      if (subcategory === "TVs,Video - Audio") {
        formData.append("categorySpecific[tvSubType]", data.tvSubType || "");
        if (data.tvSubType === "TV") {
          formData.append("categorySpecific[screenSize]", data.screenSize || "");
          formData.append("categorySpecific[displayResolution]", data.displayResolution || "");
          formData.append("categorySpecific[smartTv]", data.smartTv || "");
          formData.append("categorySpecific[operatingSystem]", data.operatingSystem || "");
          formData.append("categorySpecific[refreshRate]", data.refreshRate || "");
          formData.append("categorySpecific[soundOutput]", data.soundOutput || "");
          formData.append("categorySpecific[connectivityPorts]", data.connectivityPorts || "");
          formData.append("categorySpecific[bluetoothWifi]", data.bluetoothWifi || "");
          formData.append("categorySpecific[condition]", data.condition || "");
        }
        if (data.tvSubType === "Audio") {
          formData.append("categorySpecific[audioType]", data.audioType || "");
          formData.append("categorySpecific[powerOutput]", data.powerOutput || "");
          formData.append("categorySpecific[connectivity]", data.connectivity || "");
          formData.append("categorySpecific[numberOfChannels]", data.numberOfChannels || "");
          formData.append("categorySpecific[batteryLife]", data.batteryLife || "");
          formData.append("categorySpecific[remoteControl]", data.remoteControl || "");
          formData.append("categorySpecific[micIncluded]", data.micIncluded || "");
          formData.append("categorySpecific[condition]", data.condition || "");
        }
        if (data.tvSubType === "Video") {
          formData.append("categorySpecific[screenSize]", data.screenSize || "");
          formData.append("categorySpecific[condition]", data.condition || "");
        }
      }
      if (subcategory === "Home Appliances") {
        formData.append("categorySpecific[applianceType]", data.applianceType || "");
        if (data.applianceType === "Refrigerators") {
          formData.append("categorySpecific[refrigeratorType]", data.refrigeratorType || "");
          formData.append("categorySpecific[refrigeratorCapacity]", data.refrigeratorCapacity || "");
          formData.append("categorySpecific[energyStarRating]", data.energyStarRating || "");
          formData.append("categorySpecific[numberOfDoors]", data.numberOfDoors || "");
          formData.append("categorySpecific[defrostingType]", data.defrostingType || "");
          formData.append("categorySpecific[compressorType]", data.compressorType || "");
          if (data.builtInStabilizer)
          formData.append("categorySpecific[builtInStabilizer]", data.builtInStabilizer === "Yes");
          if (data.convertible)
          formData.append("categorySpecific[convertible]", data.convertible === "Yes");
        }
        if (data.applianceType === "Washing Machines") {
          formData.append("categorySpecific[washingMachineType]", data.washingMachineType || "");
          formData.append("categorySpecific[washingCapacity]", data.washingCapacity || "");
          formData.append("categorySpecific[dryerAvailable]", data.dryerAvailable || "");
          formData.append("categorySpecific[inBuiltHeater]", data.inBuiltHeater || "");
          formData.append("categorySpecific[waterLevelSelector]", data.waterLevelSelector || "");
          formData.append("categorySpecific[controlType]", data.controlType || "");
          formData.append("categorySpecific[washingMachineFeatures]", data.washingMachineFeatures || "");
        }
        if (data.applianceType === "Dishwashers") {
          formData.append("categorySpecific[placeSettings]", data.placeSettings || "");
          formData.append("categorySpecific[waterConsumption]", data.waterConsumption || "");
          formData.append("categorySpecific[energyConsumption]", data.energyConsumption || "");
          formData.append("categorySpecific[washPrograms]", data.washPrograms || "");
          formData.append("categorySpecific[dryingType]", data.dryingType || "");
          formData.append("categorySpecific[displayType]", data.displayType || "");
        }
        if (data.applianceType === "Air Conditioners") {
          formData.append("categorySpecific[acType]", data.acType || "");
          formData.append("categorySpecific[tonnage]", data.tonnage || "");
          formData.append("categorySpecific[energyStarRating]", data.energyStarRating || "");
          formData.append("categorySpecific[condenserCoilType]", data.condenserCoilType || "");
          formData.append("categorySpecific[suitableRoomSize]", data.suitableRoomSize || "");
          formData.append("categorySpecific[remoteControl]", data.remoteControl || "");
          formData.append("categorySpecific[smartFeatures]", data.smartFeatures || "");
        }
        if (data.applianceType === "Air Fryer") {
          formData.append("categorySpecific[brand]", data.brand || "");
          formData.append("categorySpecific[model]", data.model || "");
          formData.append("categorySpecific[capacity]", data.capacity || "");
          formData.append("categorySpecific[airFryerType]", data.airFryerType || "");

         // Features as array, matching your DB
         const airFryerFeatures = data.airFryerFeatures
         ? data.airFryerFeatures.split(",").map(f => f.trim()).filter(Boolean) : [];
         // Only append if features exist
         if (airFryerFeatures.length > 0) {
         airFryerFeatures.forEach(f =>
        formData.append("categorySpecific[airFryerFeatures][]", f)
      );
    }
  }
        formData.append("categorySpecific[condition]", data.condition || "");
      }
      if (subcategory === "Cameras & Lenses") {
        formData.append("categorySpecific[cameraType]", data.cameraType || "");
        formData.append("categorySpecific[megapixelCount]", data.megapixelCount || "");
        formData.append("categorySpecific[sensorType]", data.sensorType || "");
        formData.append("categorySpecific[lensKitIncluded]", data.lensKitIncluded || "");
        if (data.lensKitIncluded === "Yes") {
          formData.append("categorySpecific[lensKitDetails]", data.lensKitDetails || "");
        }
        formData.append("categorySpecific[isoRange]", data.isoRange || "");
        formData.append("categorySpecific[videoRecordingResolution]", data.videoRecordingResolution || "");
        formData.append("categorySpecific[opticalDigitalZoom]", data.opticalDigitalZoom || "");
        formData.append("categorySpecific[screenType]", data.screenType || "");
        formData.append("categorySpecific[condition]", data.condition || "");
      }
    }

    // Images
    images.forEach((img) => {
      formData.append("images", img);
    });

    // Debug: Log all form data entries
    console.log("FormData being sent:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Post ad
    const res = await postNewAd(formData, token);
    // Log the full response object
    console.log("Backend response:", res);

    // Check for success
    if (res && res.data && res.data.success) {
      alert("Ad sent for admin verification!");
      reset(); 
      setImages([]);
    } else if (res?.response?.data?.message) {
      alert(res.response.data.message);
      console.error("Backend error message:", res.response.data.message);
      console.error("Backend error data:", res.response.data);
    } else if (res?.response) {
      alert("Failed to post ad. See console for backend error.");
      console.error("Backend error response:", res.response);
    } else {
      alert("Failed to post ad.");
      console.error("Unknown error, full response:", res);
    }
  } catch (error) {
    console.error("Post ad error (catch block):", error);
    if (error?.response?.data) {
      console.error("Backend error (catch):", error.response.data);
      alert(error.response.data.message || "Failed to post ad");
    } else {
      alert("Failed to post ad");
    }
  }
};

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Post Your Ad</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Title */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input  type="text" {...register("title", { required: true })}
            className="w-full border rounded px-3 py-2" placeholder="Enter ad title" />
          {errors.title && (
            <span className="text-red-500 text-xs"> Title is required </span>
          )}
        </div>

        {/* Category & Subcategory */}
        <div className="mb-4 flex gap-4">
          <div>
            <label className="block font-semibold mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <input type="text" value={category} readOnly className="w-full border rounded px-3 py-2 bg-gray-100"
              {...register("category")} />
          </div>
          <div>
            <label className="block font-semibold mb-1">
              Subcategory <span className="text-red-500">*</span>
            </label>
            <input type="text" value={subcategory} readOnly className="w-full border rounded px-3 py-2 bg-gray-100"
              {...register("subcategory")} />
          </div>
        </div>

        {/* Extra fields for Mobiles */}
        {category === "Mobiles" && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
        <label className="block font-semibold mb-1"> Brand  </label>
        <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Samsung, Apple, Xiaomi" 
        {...register("brand")}/>
        </div>
        <div>
        <label className="block font-semibold mb-1"> Model </label>
        <input  type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Galaxy S21, iPhone 13" 
        {...register("model")}/>
        </div>
        <div>
        <label className="block font-semibold mb-1"> Condition <span className="text-red-500">*</span> </label>
        <select  className="w-full border rounded px-3 py-2" 
        {...register("condition", { required: "Condition is required" })} >
        <option value="">Select</option>
        <option value="New">New</option>
        <option value="Like New">Like New</option>
        <option value="Good">Good</option>
        <option value="Fair">Fair</option>
        <option value="Poor">Poor</option>
        </select>
        {errors.condition && <span className="text-red-500 text-xs">{errors.condition.message}</span>}
        </div>
        <div>
        <label className="block font-semibold mb-1"> RAM </label>
        <input type="text" {...register("ram")} className="w-full border rounded px-3 py-2" placeholder="e.g. 4GB, 6GB, 8GB" />
        </div>
        <div>
        <label className="block font-semibold mb-1"> Storage </label>
        <input type="text" {...register("storage")} className="w-full border rounded px-3 py-2" placeholder="e.g. 64GB, 128GB" />
        </div>
        <div>
      <label className="block font-semibold mb-1"> Features </label>
      <input type="text" {...register("features")} className="w-full border rounded px-3 py-2" placeholder="Comma separated, e.g. 5G, Wireless Charging, Face ID"/>
    </div>
        </div>
        )}

        {/* Sub-subcategory for TVs, Video - Audio */}
        {category === "Electronics & Appliances" &&
          subcategory === "TVs,Video - Audio" && (
            <div className="mb-4">
              <label className="block font-semibold mb-1"> Type </label>
              <select {...register("tvSubType")}
                className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="TV">Television (TV)</option>
                <option value="Video">Video</option>
                <option value="Audio">Audio</option>
              </select>
            </div>
          )}

        {/* TV-specific fields */}
        {category === "Electronics & Appliances" &&
          subcategory === "TVs,Video - Audio" && watchedTvSubType === "TV" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
            <div>
              <label className="block font-semibold mb-1"> Screen Size (inches) </label>
              <input type="number" {...register("screenSize")} className="w-full border rounded px-3 py-2" placeholder="e.g. 32, 40, 43, 50, 55" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Display Resolution </label>
              <select {...register("displayResolution")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="HD">HD</option>
                <option value="Full HD">Full HD</option>
                <option value="4K UHD">4K UHD</option>
                <option value="8K UHD">8K UHD</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Smart TV
              </label>
              <select {...register("smartTv")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Operating System </label>
              <select {...register("operatingSystem")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Android">Android</option>
                <option value="WebOS">WebOS</option>
                <option value="Tizen">Tizen</option>
                <option value="FireOS">FireOS</option>
                <option value="Roku">Roku</option>
                <option value="None">None</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Refresh Rate (Hz) </label>
              <input type="number" {...register("refreshRate")} className="w-full border rounded px-3 py-2" placeholder="e.g. 60, 120" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Sound Output (Watt) </label>
              <input type="number" {...register("soundOutput")} className="w-full border rounded px-3 py-2" placeholder="e.g. 20" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Connectivity Ports </label>
              <input type="text" {...register("connectivityPorts")} className="w-full border rounded px-3 py-2" placeholder="e.g. HDMI, USB" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Bluetooth / Wi-Fi 
              </label>
              <select {...register("bluetoothWifi")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Condition <span className="text-red-500">*</span> </label>
              <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2 mb-4" >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                  {errors.condition && <span className="text-red-500 text-xs">{errors.condition.message}</span>}
                </div>
          </div>
        )}

        {/* Audio-specific fields */}
        {category === "Electronics & Appliances" &&
          subcategory === "TVs,Video - Audio" && watchedTvSubType === "Audio" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
            <div>
              <label className="block font-semibold mb-1"> Type </label>
              <select {...register("audioType")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Home Theater">Home Theater</option>
                <option value="Sound Bar">Sound Bar</option>
                <option value="Bluetooth Speaker">Bluetooth Speaker</option>
                <option value="Party Speaker">Party Speaker</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Power Output (Watt) </label>
              <input type="number" {...register("powerOutput")} className="w-full border rounded px-3 py-2" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Connectivity </label>
              <input type="text" {...register("connectivity")} className="w-full border rounded px-3 py-2" placeholder="e.g. Bluetooth, AUX, HDMI, USB" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Number of Channels </label>
              <input type="text" {...register("numberOfChannels")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2.1, 5.1" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Battery Life (if portable) </label>
              <input type="text" {...register("batteryLife")} className="w-full border rounded px-3 py-2" placeholder="e.g. 10 hours" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Remote Control </label>
              <select {...register("remoteControl")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Mic Included </label>
              <select {...register("micIncluded")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Condition <span className="text-red-500">*</span> </label>
              <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2 mb-4" >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                  {errors.condition && (<span className="text-red-500 text-xs">{errors.condition.message}</span>)}
                </div>
          </div>
        )}

        {/* Video-specific fields */}
        {category === "Electronics & Appliances" &&
          subcategory === "TVs,Video - Audio" && watchedTvSubType === "Video" && (
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
              <div>
                <label className="block font-semibold mb-1"> Screen Size </label>
                <input type="text" {...register("screenSize")} className="w-full border rounded px-3 py-2" placeholder="e.g. 55 inches" />
              </div>
                          <div>
              <label className="block font-semibold mb-1"> Condition <span className="text-red-500">*</span> </label>
              <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2 mb-4" >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                  {errors.condition && (<span className="text-red-500 text-xs">{errors.condition.message}</span>)}
                </div>
            </div>
          )}

        {/* Home Appliances-specific field */}
        {category === "Electronics & Appliances" &&
          subcategory === "Home Appliances" && (
          <>
            <div className="mb-4">
              <label className="block font-semibold mb-1">
                Appliance Type <span className="text-red-500">*</span>
              </label>
              <select {...register("applianceType")}
                className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Refrigerators">REFRIGERATORS</option>
                <option value="Washing Machines">WASHING MACHINES</option>
                <option value="Dishwashers">DISHWASHERS</option>
                <option value="Air Conditioners">AIR CONDITIONERS</option>
                <option value="Air Fryer">AIR FRYER</option>
              </select>
            </div>
            {/* Refrigerator-specific fields */}
            {watch("applianceType") === "Refrigerators" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
                <div>
                  <label className="block font-semibold mb-1"> Type </label>
                  <select {...register("refrigeratorType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Direct Cool">Direct Cool</option>
                    <option value="Frost Free">Frost Free</option>
                    <option value="CBU">CBU</option>
                    <option value="Side by Side">Side by Side</option>
                    <option value="Bottom Mounted">Bottom Mounted</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">  Capacity (Litres) </label>
                  <input {...register("refrigeratorCapacity")} type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 250" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Energy Star Rating </label>
                  <select {...register("energyStarRating")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="1 Star">1 Star</option>
                    <option value="2 Star">2 Star</option>
                    <option value="3 Star">3 Star</option>
                    <option value="4 Star">4 Star</option>
                    <option value="5 Star">5 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Number of Doors </label>
                  <input {...register("numberOfDoors")} type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 2" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Defrosting Type </label>
                  <input {...register("defrostingType")} type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Manual, Automatic" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Compressor Type </label>
                  <select {...register("compressorType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Normal">Normal</option>
                    <option value="Inverter">Inverter</option>
                    <option value="Digital Inverter">Digital Inverter</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                  Built-in Stabilizer
                  </label>
                  <select {...register("builtInStabilizer")} className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    Convertible
                  </label>
                  <select {...register("convertible")} className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}
            {/* Washing Machine-specific fields */}
            {watch("applianceType") === "Washing Machines" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
                <div>
                  <label className="block font-semibold mb-1"> Type  </label>
                  <select {...register("washingMachineType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                    <option value="Top Load">Top Load</option>
                    <option value="Front Load">Front Load</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Washing Capacity (kg) </label>
                  <input {...register("washingCapacity")} type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 7" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Dryer Available </label>
                  <select {...register("dryerAvailable")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> In-built Heater </label>
                  <select {...register("inBuiltHeater")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Water Level Selector </label>
                  <select {...register("waterLevelSelector")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">  Control Type  </label>
                  <select {...register("controlType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Touch">Touch</option>
                    <option value="Button">Button</option>
                    <option value="Rotary">Rotary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Washing Machine Features</label>
                  <textarea {...register("washingMachineFeatures")} className="w-full border rounded px-3 py-2"
                  placeholder="Comma separated (e.g. Inverter, Steam Function)" />
                </div>
              </div>
            )}
            {/* Dishwasher-specific fields */}
            {watch("applianceType") === "Dishwashers" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
                <div>
                  <label className="block font-semibold mb-1"> Place Settings (Number) 
                  </label>
                  <input type="number" {...register("placeSettings")} className="w-full border rounded px-3 py-2" placeholder="e.g. 12" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Water Consumption (Liters/Cycle) </label>
                  <input {...register("waterConsumption")} className="w-full border rounded px-3 py-2" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Energy Consumption (kWh/year)  </label>
                  <input {...register("energyConsumption")} type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 250" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Number of Wash Programs </label>
                  <input {...register("washPrograms")} type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 6" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Drying Type </label>
                  <select {...register("dryingType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Hot Air">Hot Air</option>
                    <option value="Condensation">Condensation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Display Type </label>
                  <select {...register("displayType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Digital">Digital</option>
                    <option value="LED">LED</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>
            )}
            {/* Air Conditioner-specific fields */}
            {watch("applianceType") === "Air Conditioners" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
                <div>
                  <label className="block font-semibold mb-1"> Type </label>
                  <select {...register("acType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Inverter">Inverter</option>
                    <option value="Non-Inverter">Non-Inverter</option>
                    <option value="Portable">Portable</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Tonnage </label>
                  <select {...register("tonnage")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="0.5 Ton">0.5 Ton</option>
                    <option value="0.75 Ton">0.75 Ton</option>
                    <option value="1 Ton">1 Ton</option>
                    <option value="1.5 Ton">1.5 Ton</option>
                    <option value="2 Ton">2 Ton</option>
                    <option value="2.5 Ton">2.5 Ton</option>
                    <option value="3 Ton">3 Ton</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Energy Star Rating </label>
                  <select {...register("energyStarRating")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="1 Star">1 Star</option>
                    <option value="2 Star">2 Star</option>
                    <option value="3 Star">3 Star</option>
                    <option value="4 Star">4 Star</option>
                    <option value="5 Star">5 Star</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Condenser Coil Type </label>
                  <select {...register("condenserCoilType")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Copper">Copper</option>
                    <option value="Aluminium">Aluminium</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Suitable Room Size (in sq. ft.)
                  </label>
                  <input type="number" {...register("suitableRoomSize")} className="w-full border rounded px-3 py-2" placeholder="e.g. 150" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Remote Control  </label>
                  <select {...register("remoteControl")} className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Wi-Fi Enabled / Smart Features </label>
                  <select {...register("smartFeatures")} className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}
            
            {/* Air Fryer-specific fields */}
            {watch("applianceType") === "Air Fryer" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
              <div>
                <label className="block font-semibold mb-1">Brand</label>
                <input type="text" {...register("brand")} className="w-full border rounded px-3 py-2" placeholder="e.g. Philips, Havells" />
              </div>
               <div>
                <label className="block font-semibold mb-1">Model</label>
                <input type="text" {...register("model")} className="w-full border rounded px-3 py-2" placeholder="e.g. HD9650/96" />
              </div>
              <div>
              <label className="block font-semibold mb-1">Capacity (Litres)</label>
              <input type="number" {...register("capacity")} className="w-full border rounded px-3 py-2" placeholder="e.g. 6.2" />
              </div>
              <div>
              <label className="block font-semibold mb-1">Air Fryer Type</label>
              <select {...register("airFryerType")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Paddle">Paddle</option>
                <option value="Basket">Basket</option>
                <option value="Oven">Oven</option>
              </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Features</label>
                <input type="text" {...register("airFryerFeatures")} className="w-full border rounded px-3 py-2" placeholder="e.g. Digital Display, Multiple Functions"/>
              </div>
              </div>
            )}
            
            <div>
              <label className="block font-semibold mb-1"> Condition <span className="text-red-500">*</span></label>
              <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2 mb-4" >
                    <option value="">Select</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
              </select>
              {errors.condition && <span className="text-red-500 text-xs">{errors.condition.message}</span>}
            </div>
          </>
        )}

        {/* Camera-specific fields */}
        {category === "Electronics & Appliances" &&
          subcategory === "Cameras & Lenses" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
            <div>
              <label className="block font-semibold mb-1"> Type </label>
              <select {...register("cameraType")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="DSLR">DSLR</option>
                <option value="SLR">SLR</option>
                <option value="Digital">Digital</option>
                <option value="Mirrorless">Mirrorless</option>
                <option value="Action Camera">Action Camera</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Megapixel Count </label>
              <input type="number" {...register("megapixelCount")} className="w-full border rounded px-3 py-2" placeholder="e.g. 24" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Sensor Type </label>
              <select {...register("sensorType")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="CMOS">CMOS</option>
                <option value="CCD">CCD</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Lens Kit Included  </label>
              <select {...register("lensKitIncluded")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            {/* If lens kit included, specify details */}
            {watch("lensKitIncluded") === "Yes" && (
              <div>
                <label className="block font-semibold mb-1"> Lens Kit Details </label>
                <input type="text" {...register("lensKitDetails")} className="w-full border rounded px-3 py-2" placeholder="e.g. 18-55mm, 70-300mm" />
              </div>
            )}
            <div>
              <label className="block font-semibold mb-1"> ISO Range </label>
              <input type="text" {...register("isoRange")} className="w-full border rounded px-3 py-2" placeholder="e.g. 100-25600" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Video Recording Resolution </label>
              <select {...register("videoRecordingResolution")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="4K">4K</option>
                <option value="Full HD">Full HD</option>
                <option value="HD">HD</option>
                <option value="SD">SD</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Optical Zoom & Digital Zoom </label>
              <input type="text" {...register("opticalDigitalZoom")} className="w-full border rounded px-3 py-2" placeholder="e.g. 10x Optical, 4x Digital" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Screen Type 
              </label>
              <select {...register("screenType")} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Touchscreen">Touchscreen</option>
                <option value="Fixed">Fixed</option>
                <option value="Articulating">Articulating</option>
              </select>
            </div>
                <div>
                  <label className="block font-semibold mb-1"> Condition <span className="text-red-500">*</span></label>
                  <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2 mb-4" >
                    <option value="">Select</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                  {errors.condition && <span className="text-red-500 text-xs">{errors.condition.message}</span>}
                </div>
          </div>
        )}        

        {/* Extra fields for Vehicles */}
        {category === "Vehicles" && ["Cars", "Motorcycles", "Scooters", "Commercial Vehicles"].includes(subcategory) && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Brand</label>
              <input type="text" {...register("brand")} className="w-full border rounded px-3 py-2" placeholder="e.g. Maruti, Honda, Hero" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Year</label>
              <input type="number" {...register("year")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2018" />
            </div>
            <div>
              <label className="block font-semibold mb-1">KM Driven</label>
              <input type="number" {...register("kmDriven")} className="w-full border rounded px-3 py-2" placeholder="e.g. 35000" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Fuel Type</label>
              <select {...register("fuelType")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="CNG">CNG</option>
                <option value="LPG">LPG</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Transmission</label>
              <select {...register("transmission")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
                <option value="AMT">AMT</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Owner</label>
              <select {...register("owner")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
                <option value="Fourth">Fourth</option>
                <option value="Fifth">Fifth</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Condition <span className="text-red-500">*</span> </label>
              <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
              {errors.condition && <span className="text-red-500 text-xs">{errors.condition.message}</span>}
            </div>
          </div>
        )}

                {/* Extra fields for Vehicles spare parts */}
        {category === "Vehicles" && ["Spare Parts"].includes(subcategory) && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Brand</label>
              <input type="text" {...register("brand")} className="w-full border rounded px-3 py-2" placeholder="e.g. Maruti, Honda, Hero" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Year</label>
              <input type="number" {...register("year")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2018" />
            </div>
            {/* Fuel Type */}
    <div>
      <label className="block font-semibold mb-1">Fuel Type</label>
      <select {...register("fuelType")} className="w-full border rounded px-3 py-2">
        <option value="">Select</option>
        <option value="Petrol">Petrol</option>
        <option value="Diesel">Diesel</option>
        <option value="Electric">Electric</option>
        <option value="Hybrid">Hybrid</option>
        <option value="CNG">CNG</option>
        <option value="LPG">LPG</option>
      </select>
    </div>
    {/* Transmission */}
    <div>
      <label className="block font-semibold mb-1">Transmission</label>
      <select {...register("transmission")} className="w-full border rounded px-3 py-2">
        <option value="">Select</option>
        <option value="Manual">Manual</option>
        <option value="Automatic">Automatic</option>
        <option value="CVT">CVT</option>
        <option value="AMT">AMT</option>
      </select>
    </div>
    {/* Owner */}
    <div>
      <label className="block font-semibold mb-1">Owner</label>
      <select {...register("owner")} className="w-full border rounded px-3 py-2">
        <option value="">Select</option>
        <option value="First">First</option>
        <option value="Second">Second</option>
        <option value="Third">Third</option>
        <option value="Fourth">Fourth</option>
        <option value="Fifth">Fifth</option>
      </select>
    </div>
    {/* Condition */}
    <div>
      <label className="block font-semibold mb-1">Condition <span className="text-red-500">*</span></label>
      <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2">
        <option value="">Select</option>
        <option value="New">New</option>
        <option value="Like New">Like New</option>
        <option value="Good">Good</option>
        <option value="Fair">Fair</option>
        <option value="Poor">Poor</option>
      </select>
      {errors.condition && <span className="text-red-500 text-xs">{errors.condition.message}</span>}
    </div>
          </div>
        )}

        {/* Extra fields for Real Estate */}
        {category === "Real Estate" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Type</label>
              <select {...register("type")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Flat">Flat</option>
                <option value="Villa">Villa</option>
                <option value="House">House</option>
                <option value="Plot">Plot</option>
                <option value="Commercial">Commercial</option>
                <option value="PG">PG</option>
                <option value="Room">Room</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">BHK</label>
              <input type="number" {...register("bhk")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2, 3, 4" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Area (sq.ft.)</label>
              <input type="number" {...register("area")} className="w-full border rounded px-3 py-2" placeholder="e.g. 1200" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Furnishing</label>
              <select {...register("furnishing")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Bedrooms</label>
              <input type="number" {...register("bedrooms")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Bathrooms</label>
              <input type="number" {...register("bathrooms")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2" />
            </div>
          </div>
        )}

        {/* Extra fields for Jobs */}
        {category === "Jobs" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Job Type</label>
              <select {...register("jobType")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Experience</label>
              <input type="text" {...register("experience")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2 years, Fresher" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Salary Range <span className="text-red-500">*</span></label>
              <input type="text" {...register("salaryRange")} className="w-full border rounded px-3 py-2" placeholder="e.g. 15,000 - 25,000" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Role</label>
              <input type="text" {...register("role")} className="w-full border rounded px-3 py-2" placeholder="e.g. Sales Executive, Data Entry" />
            </div>
          </div>
        )}

        {/* Extra fields for Services */}
        {category === "Services" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Service Type</label>
              <input type="text" {...register("serviceType")} className="w-full border rounded px-3 py-2" placeholder="e.g. Plumber, Electrician, Coaching" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Available Timings</label>
              <input type="text" {...register("availableTimings")} className="w-full border rounded px-3 py-2" placeholder="e.g. 9am-6pm, Weekends only" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Charges (if any)</label>
              <input type="text" {...register("charges")} className="w-full border rounded px-3 py-2" placeholder="e.g. 500 per visit, Free consultation" />
            </div>
          </div>
        )}

        {/* Furniture-specific fields */}
        {category === "Furniture" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Type</label>
              <input type="text" {...register("type")} className="w-full border rounded px-3 py-2" placeholder="e.g. Study Table & Chair Set" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Features</label>
              <input type="text" {...register("features")} className="w-full border rounded px-3 py-2" placeholder="e.g. Adjustable Height" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Includes</label>
              <input type="text" {...register("includes")} className="w-full border rounded px-3 py-2" placeholder="e.g. Storage Drawer, Book Holder" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Condition <span className="text-red-500">*</span></label>
              <select {...register("condition", { required: "Condition is required" })} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
              {errors.condition && <span className="text-red-500 text-xs">{errors.condition.message}</span>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Furniture Material</label>
              <input type="text" {...register("furnitureMaterial")} className="w-full border rounded px-3 py-2" placeholder="e.g. Safe, Non-toxic" />
            </div>
          </div>
        )}

        {/* Extra fields for Pets */}
        {category === "Pets" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Breed</label>
              <input type="text" {...register("breed")} className="w-full border rounded px-3 py-2" placeholder="e.g. Labrador, Persian Cat" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Age</label>
              <input type="text" {...register("age")} className="w-full border rounded px-3 py-2" placeholder="e.g. 2 months, 1 year" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Vaccination Status</label>
              <select {...register("vaccinationStatus")} className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Vaccinated">Vaccinated</option>
                <option value="Not Vaccinated">Not Vaccinated</option>
                <option value="Partially Vaccinated">Partially Vaccinated</option>
              </select>
            </div>
          </div>
        )}

        {/* Photos */}
        <div className="mb-4">
      <label className="block font-semibold mb-1">
        Photos <span className="text-red-500">*</span>
      </label>
      <input
        type="file"
        {...register("photos")}
        accept="image/*"
        multiple
        onChange={handleImageChange}
        className="border max-w-200 p-1 bg-gray-300 cursor-pointer"
        disabled={images.length >= 5}
      />
      <div className="text-xs text-gray-600">
        Upload 1-5 images. {images.length}/5 added.
      </div>
      {imageError && (
        <span className="text-red-500 text-xs">{imageError}</span>
      )}
      {images.length === 0 && (
        <span className="text-red-500 text-xs">At least 1 image is required</span>
      )}
      {images.length > 0 && (
        <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative">
              <img
                src={URL.createObjectURL(img)}
                alt="preview"
                className="w-16 h-16 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">
            Description <span className="text-red-500">*</span>
          </label>
        <textarea 
  {...register("description", { 
    required: true,
    minLength: { value: 30, message: "Description should be at least 30 characters" },
    maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" }
  })} 
  className="w-full border rounded px-3 py-2"
  placeholder="Describe your item" 
  rows={4} 
/>
{errors.description && (
  <span className="text-red-500 text-xs">{errors.description.message}</span>
)}
</div>

        {/* Price */}
        {category !== "Jobs" && (
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Price <span className="text-red-500">*</span> </label>
          <div className="flex gap-2 items-center">
            <input type="number" {...register("price", { required:"Price is required", valueAsNumber: true, validate: value => value >= 0 || "Price must be non-negative" })} 
            className="border rounded px-3 py-2 w-32" placeholder="Amount" />
            <select {...register("priceType")} className="border rounded px-2 py-2" >
              <option value="Fixed">Fixed</option>
              <option value="Negotiable">Negotiable</option>
              <option value="Free">Free</option>
            </select>
          {errors.price && <span className="text-red-500 text-xs">{errors.price.message}</span>}
          </div>
        </div>
        )}

        {/* Location */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">City <span className="text-red-500">*</span></label>
            <input type="text" {...register("city", { required: "City is required" })} className="w-full border rounded px-3 py-2" placeholder="e.g. Chennai" />
            {errors.city && <span className="text-red-500 text-xs">{errors.city.message}</span>}
          </div>
          <div>
            <label className="block font-semibold mb-1">State <span className="text-red-500">*</span></label>
            <input type="text" {...register("state", { required: "State is required" })} className="w-full border rounded px-3 py-2" placeholder="e.g. Tamil Nadu" />
            {errors.state && <span className="text-red-500 text-xs">{errors.state.message}</span>}
          </div>
          <div>
            <label className="block font-semibold mb-1">Pincode</label>
            <input type="text" {...register("pincode")} className="w-full border rounded px-3 py-2" placeholder="e.g. 600001" />
          </div>
          <div>
            <label className="block font-semibold mb-1">Address</label>
            <input type="text" {...register("address")} className="w-full border rounded px-3 py-2" placeholder="e.g. Anna Nagar, Chennai" />
          </div>
        </div>

        {/* Contact Info */}
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Name  <span className="text-red-500">*</span></label>
          <input type="text" {...register("name", { required: "Name is required" })} className="w-full border rounded px-3 py-2"
            placeholder="Your name" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Phone Number <span className="text-red-500">*</span> </label>
          <input type="tel" {...register("phone", { pattern: /^[0-9]{10}$/, required: "10-digit phone number is required" })}
            className="w-full border rounded px-3 py-2" placeholder="10-digit phone number" />
            {errors.phone && <span className="text-red-500 text-xs">{errors.phone.message}</span>}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Email (optional)</label>
          <input type="email" {...register("email")} className="w-full border rounded px-3 py-2" placeholder="Email address (optional)" />
        </div>
        <div className="mb-4">
  <label className="inline-flex items-center">
    <input
      type="checkbox"
      {...register("termsAccepted", { required: true })}
      className="mr-2"
    />
    <span>
      I accept the <a href="/terms" target="_blank" className="text-blue-600 underline">Terms & Conditions</a>
      <span className="text-red-500">*</span>
    </span>
  </label>
  {errors.termsAccepted && (
    <span className="text-red-500 text-xs">You must accept the terms.</span>
  )}
</div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          disabled={images.length === 0}> Post Ad </button>
      </form>
    </div>
  );
}