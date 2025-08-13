import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useState } from "react";

export default function PostAdForm() {
  const { category, subcategory } = useParams();
  const { register, handleSubmit, formState: { errors }, watch, } = useForm();
  const [images, setImages] = useState([]);

  // Watch for subSubCategory selectionn
  const watchedTvSubType = watch("tvSubType");

  const onSubmit = () => {
    alert("Ad posted successfully!");
  };

  // Allow adding more images up to 5, appending new ones
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // Filter out duplicates by name+size (not perfect, but works for most cases)
    const existingKeys = new Set(images.map((img) => img.name + img.size));
    const newFiles = files.filter(
      (file) => !existingKeys.has(file.name + file.size)
    );
    const total = images.length + newFiles.length;
    if (total > 5) {
      // Only add up to 5 images
      const allowed = 5 - images.length;
      setImages([...images, ...newFiles.slice(0, allowed)]);
    } else {
      setImages([...images, ...newFiles]);
    }
    // Reset input value so user can re-select same file if needed
    e.target.value = "";
  };

  // Optionally: Remove image
  const handleRemoveImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
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
          <input  type="text" maxLength={70} {...register("title", { required: true, maxLength: 70 })}
            className="w-full border rounded px-3 py-2" placeholder="Enter ad title (max 70 characters)" />
          {errors.title && (
            <span className="text-red-500 text-xs"> Title is required (max 70 chars) </span>
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
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Samsung, Apple, Xiaomi" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Model </label>
              <input  type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Galaxy S21, iPhone 13" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Condition </label>
              <select  className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> RAM </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 4GB, 6GB, 8GB" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Storage </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 64GB, 128GB" />
            </div>
          </div>
        )}

        {/* Sub-subcategory for TVs, Video - Audio */}
        {category === "Electronics & Appliances" &&
          subcategory === "TVs, Video - Audio" && (
            <div className="mb-4">
              <label className="block font-semibold mb-1"> Type <span className="text-red-500">*</span></label>
              <select {...register("tvSubType", { required: true })}
                className="w-100 border rounded px-3 py-2" defaultValue="" >
                <option value="">Select</option>
                <option value="TV">Television (TV)</option>
                <option value="Video">Video</option>
                <option value="Audio">Audio</option>
              </select>
              {errors.tvSubType && (
                <span className="text-red-500 text-xs">Type is required</span>
              )}
            </div>
          )}

        {/* TV-specific fields */}
        {category === "Electronics & Appliances" &&
          subcategory === "TVs, Video - Audio" && watchedTvSubType === "TV" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
            <div>
              <label className="block font-semibold mb-1"> Screen Size (inches) </label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 32, 40, 43, 50, 55" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Display Resolution </label>
              <select className="w-full border rounded px-3 py-2" >
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
              <select className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Operating System </label>
              <select className="w-full border rounded px-3 py-2" >
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
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 60, 120" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Sound Output (Watt) </label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 20" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Connectivity Ports </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. HDMI, USB" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Bluetooth / Wi-Fi 
              </label>
              <select className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
                  <label className="block font-semibold mb-1"> Condition </label>
                  <select className="w-full border rounded px-3 py-2 mb-4" >
                    <option value="">Select</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
          </div>
        )}

        {/* Audio-specific fields */}
        {category === "Electronics & Appliances" &&
          subcategory === "TVs, Video - Audio" && watchedTvSubType === "Audio" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
            <div>
              <label className="block font-semibold mb-1"> Type </label>
              <select className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Home Theater">Home Theater</option>
                <option value="Sound Bar">Sound Bar</option>
                <option value="Bluetooth Speaker">Bluetooth Speaker</option>
                <option value="Party Speaker">Party Speaker</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Power Output (Watt) </label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 100" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Connectivity </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Bluetooth, AUX, HDMI, USB" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Number of Channels </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 2.1, 5.1" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Battery Life (if portable) </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 10 hours" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Remote Control </label>
              <select className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Mic Included </label>
              <select  className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
                        <div>
                  <label className="block font-semibold mb-1"> Condition </label>
                  <select className="w-full border rounded px-3 py-2 mb-4" >
                    <option value="">Select</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
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
              <select {...register("applianceType", { required: true })}
                className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Refrigerators">REFRIGERATORS</option>
                <option value="Washing Machines">WASHING MACHINES</option>
                <option value="Dishwashers">DISHWASHERS</option>
                <option value="Air Conditioners">AIR CONDITIONERS</option>
              </select>
              {errors.applianceType && (
                <span className="text-red-500 text-xs">
                  Appliance Type is required
                </span>
              )}
            </div>
            {/* Refrigerator-specific fields */}
            {watch("applianceType") === "Refrigerators" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
                <div>
                  <label className="block font-semibold mb-1"> Type </label>
                  <select className="w-full border rounded px-3 py-2" >
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
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 250" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Energy Star Rating </label>
                  <select className="w-full border rounded px-3 py-2" >
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
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 2" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Defrosting Type </label>
                  <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Manual, Automatic" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Compressor Type </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Normal">Normal</option>
                    <option value="Inverter">Inverter</option>
                    <option value="Digital Inverter">Digital Inverter</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Built-in Stabilizer </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Convertible </label>
                  <select className="w-full border rounded px-3 py-2" >
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
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                    <option value="Top Load">Top Load</option>
                    <option value="Front Load">Front Load</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Washing Capacity (kg) </label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 7" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Dryer Available </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> In-built Heater </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Water Level Selector </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">  Control Type  </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Touch">Touch</option>
                    <option value="Button">Button</option>
                    <option value="Rotary">Rotary</option>
                  </select>
                </div>
              </div>
            )}
            {/* Dishwasher-specific fields */}
            {watch("applianceType") === "Dishwashers" && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
                <div>
                  <label className="block font-semibold mb-1"> Place Settings (Number) 
                  </label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 12" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Water Consumption (Liters/Cycle) </label>
                  <input className="w-full border rounded px-3 py-2" placeholder="e.g. 10" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Energy Consumption (kWh/year)  </label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 250" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Number of Wash Programs </label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 6" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Drying Type </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Hot Air">Hot Air</option>
                    <option value="Condensation">Condensation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Display Type </label>
                  <select className="w-full border rounded px-3 py-2" >
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
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Inverter">Inverter</option>
                    <option value="Non-Inverter">Non-Inverter</option>
                    <option value="Portable">Portable</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Tonnage </label>
                  <select className="w-full border rounded px-3 py-2" >
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
                  <select className="w-full border rounded px-3 py-2" >
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
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Copper">Copper</option>
                    <option value="Aluminium">Aluminium</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Suitable Room Size (in sq. ft.)
                  </label>
                  <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 150" />
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Remote Control  </label>
                  <select className="w-full border rounded px-3 py-2">
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1"> Wi-Fi Enabled / Smart Features </label>
                  <select className="w-full border rounded px-3 py-2" >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}
            <div>
                  <label className="block font-semibold mb-1"> Condition </label>
                  <select className="w-full border rounded px-3 py-2 mb-4" >
                    <option value="">Select</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
          </>
        )}

        {/* Camera-specific fields */}
        {category === "Electronics & Appliances" &&
          subcategory === "Cameras & Lenses" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded border border-blue-200">
            <div>
              <label className="block font-semibold mb-1"> Type </label>
              <select className="w-full border rounded px-3 py-2" >
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
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 24" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Sensor Type </label>
              <select className="w-full border rounded px-3 py-2">
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
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 18-55mm, 70-300mm" />
              </div>
            )}
            <div>
              <label className="block font-semibold mb-1"> ISO Range </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 100-25600" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Video Recording Resolution </label>
              <select className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="4K">4K</option>
                <option value="Full HD">Full HD</option>
                <option value="HD">HD</option>
                <option value="SD">SD</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Optical Zoom & Digital Zoom </label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 10x Optical, 4x Digital" />
            </div>
            <div>
              <label className="block font-semibold mb-1"> Screen Type 
              </label>
              <select className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="Touchscreen">Touchscreen</option>
                <option value="Fixed">Fixed</option>
                <option value="Articulating">Articulating</option>
              </select>
            </div>
                <div>
                  <label className="block font-semibold mb-1"> Condition </label>
                  <select className="w-full border rounded px-3 py-2 mb-4" >
                    <option value="">Select</option>
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
          </div>
        )}        

        {/* Extra fields for Vehicles */}
        {category === "Vehicles" && ["Cars", "Motorcycles", "Scooters", "Commercial Vehicles"].includes(subcategory) && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Brand</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Maruti, Honda, Hero" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Year</label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 2018" />
            </div>
            <div>
              <label className="block font-semibold mb-1">KM Driven</label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 35000" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Fuel Type</label>
              <select className="w-full border rounded px-3 py-2">
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
              <select className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
                <option value="CVT">CVT</option>
                <option value="AMT">AMT</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Owner</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="First">First</option>
                <option value="Second">Second</option>
                <option value="Third">Third</option>
                <option value="Fourth">Fourth</option>
                <option value="Fifth">Fifth</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1"> Condition </label>
              <select className="w-full border rounded px-3 py-2" >
                <option value="">Select</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>
        )}

        {/* Extra fields for Real Estate */}
        {category === "Real Estate" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Type</label>
              <select className="w-full border rounded px-3 py-2">
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
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 2, 3, 4" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Area (sq.ft.)</label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 1200" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Furnishing</label>
              <select className="w-full border rounded px-3 py-2">
                <option value="">Select</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">Bedrooms</label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Bathrooms</label>
              <input type="number" className="w-full border rounded px-3 py-2" placeholder="e.g. 2" />
            </div>
          </div>
        )}

        {/* Extra fields for Jobs */}
        {category === "Jobs" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Job Type</label>
              <select className="w-full border rounded px-3 py-2">
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
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 2 years, Fresher" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Salary Range <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 15,000 - 25,000" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Role</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Sales Executive, Data Entry" />
            </div>
          </div>
        )}

        {/* Extra fields for Services */}
        {category === "Services" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Service Type</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Plumber, Electrician, Coaching" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Available Timings</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 9am-6pm, Weekends only" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Charges (if any)</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 500 per visit, Free consultation" />
            </div>
          </div>
        )}

        {/* Extra fields for Pets */}
        {category === "Pets" && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1">Breed</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. Labrador, Persian Cat" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Age</label>
              <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g. 2 months, 1 year" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Vaccination Status</label>
              <select className="w-full border rounded px-3 py-2">
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
          <label className="block font-semibold mb-1"> Photos <span className="text-red-500">*</span> </label>
          <input type="file" accept="image/*" multiple onChange={handleImageChange}
            className="border max-w-200 p-1 bg-gray-300 cursor-pointer" disabled={images.length >= 5} />
          <div className="text-xs text-gray-600">
            Upload 1-5 images. {images.length}/5 added.
          </div>
          {images.length === 0 && ( <span className="text-red-500 text-xs"> At least 1 image is required </span>
          )}
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={URL.createObjectURL(img)} alt="preview" className="w-16 h-16 object-cover rounded border" />
                  {/* Remove button */}
                  <button type="button" onClick={() => handleRemoveImage(idx)}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Remove" > × </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Description </label>
          <textarea className="w-full border rounded px-3 py-2"
            placeholder="Describe your item" rows={4} />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Price </label>
          <div className="flex gap-2 items-center">
            <input type="number" className="border rounded px-3 py-2 w-32" placeholder="Amount" />
            <select className="border rounded px-2 py-2" >
              <option value="Fixed">Fixed</option>
              <option value="Negotiable">Negotiable</option>
              <option value="Free">Free</option>
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Location </label>
          <input type="text" className="w-full border rounded px-3 py-2" placeholder="Enter location or use auto-detect" />
        </div>

        {/* Contact Info */}
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Name </label>
          <input type="text" className="w-full border rounded px-3 py-2"
            placeholder="Your name" />
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1"> Phone Number <span className="text-red-500">*</span> </label>
          <input type="tel" {...register("phone", { required: true, pattern: /^[0-9]{10}$/, })}
            className="w-full border rounded px-3 py-2" placeholder="10-digit phone number" />
          {errors.phone && (
            <span className="text-red-500 text-xs"> Valid phone number required </span>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Email (optional)</label>
          <input type="email" {...register("email")} className="w-full border rounded px-3 py-2" placeholder="Email address (optional)" />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700"
          disabled={images.length === 0}> Post Ad </button>
      </form>
    </div>
  );
}