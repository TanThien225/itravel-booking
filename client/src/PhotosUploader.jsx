import axios from "axios";
import { useState } from "react";
import PropTypes from "prop-types";

// eslint-disable-next-line react/prop-types
export default function PhotosUploader({ addedPhotos, onChange }) {
  //   const [addedPhotos, setAddedPhotos] = useState([]);
  const [photoLink, setPhotoLink] = useState("");
  // add address of photo
  async function addPhotoByLink(event) {
    event.preventDefault();
    if (!photoLink) {
      return Promise.reject(new Error("The photo link is required"));
    }
    try {
      // Assuming axios is properly imported and available
      const { data: filename } = await axios.post("/upload-by-link", {
        link: photoLink,
      });
      onChange((prev) => {
        return [...prev, filename];
      });

      // Handle success if needed
    } catch (error) {
      // Handle error, maybe log it or perform other actions
      return Promise.reject(
        new Error(`Failed to upload photo: ${error.message}`)
      );
    }
    setPhotoLink("");
  }

  //Adding photos from device
  function uploadPhotos(event) {
    event.preventDefault();
    const files = event.target.files;
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append("photos", files[i]);
    }
    axios
      .post("/upload", data, {
        headers: { "Content-type": "multipart/form-data" },
      })
      .then((response) => {
        const { data: filenames } = response;
        onChange((prev) => {
          //ADd more than 1 photos
          return [...prev, ...filenames];
        });
      });
  }

  function removePhoto(event, filename) {
    event.preventDefault();
    onChange([...addedPhotos.filter((photo) => photo !== filename)]);
  }

  function selectAsMainPhoto(event, filename) {
    event.preventDefault();
    // const addedPhotosWithoutSelected = addedPhotos.filter(
    //   (photo) => photo !== filename
    // );
    // //remove and move selected img to top
    // const newAddedPhotos = [filename, ...addedPhotosWithoutSelected];

    const newAddedPhotos = [
      filename,
      ...addedPhotos.filter((photo) => photo !== filename),
    ];

    onChange(newAddedPhotos);
  }
  return (
    <>
      <div className="flex gap-2">
        <input
          type="text"
          value={photoLink}
          onChange={(event) => setPhotoLink(event.target.value)}
          placeholder="Thêm đường dẫn hình ảnh jpg/png..."
        />
        <button
          onClick={addPhotoByLink}
          className="bg-gray-200 px-4 rounded-2xl"
        >
          Thêm&nbsp;ảnh
        </button>
      </div>
      <div className="mt-2 grid gap-2 grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {/* Check if it has any photo and print out */}
        {Array.isArray(addedPhotos) &&
          addedPhotos.length > 0 &&
          addedPhotos.map((link) => (
            <div className="h-64 flex relative" key={link}>
              <img
                className="rounded-2xl w-full object-cover position"
                src={"http://localhost:4000/uploads/" + link}
                alt=""
              />
              <button
                onClick={(event) => removePhoto(event, link)}
                className="cursor-pointer absolute bottom-1 right-1 text-white bg-black bg-opacity-50 rounded-xl p-2 py-2 px-2"
              >
                <svg
                  className="fill-[#ffffff]"
                  xmlns="http://www.w3.org/2000/svg"
                  height="1em"
                  viewBox="0 0 448 512"
                >
                  <path d="M64 80c-8.8 0-16 7.2-16 16V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V96c0-8.8-7.2-16-16-16H64zM0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96zM152 232H296c13.3 0 24 10.7 24 24s-10.7 24-24 24H152c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
                </svg>
              </button>
              <button
                onClick={(event) => selectAsMainPhoto(event, link)}
                className="cursor-pointer absolute bottom-1 left-1 text-white bg-black bg-opacity-50 rounded-xl p-2 py-2 px-2"
              >
                {link === addedPhotos[0] && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#FFCD4B"
                    className="w-4 h-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {link !== addedPhotos[0] && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        <label className="h-64 flex items-center gap-2 justify-center border bg-transparent rounded-2xl p-2 text-xl text-gray-600 cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={uploadPhotos}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="1em"
            viewBox="0 0 576 512"
            className="w-8 h-8"
          >
            <path d="M160 80H512c8.8 0 16 7.2 16 16V320c0 8.8-7.2 16-16 16H490.8L388.1 178.9c-4.4-6.8-12-10.9-20.1-10.9s-15.7 4.1-20.1 10.9l-52.2 79.8-12.4-16.9c-4.5-6.2-11.7-9.8-19.4-9.8s-14.8 3.6-19.4 9.8L175.6 336H160c-8.8 0-16-7.2-16-16V96c0-8.8 7.2-16 16-16zM96 96V320c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H160c-35.3 0-64 28.7-64 64zM48 120c0-13.3-10.7-24-24-24S0 106.7 0 120V344c0 75.1 60.9 136 136 136H456c13.3 0 24-10.7 24-24s-10.7-24-24-24H136c-48.6 0-88-39.4-88-88V120zm208 24a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
          </svg>
          Upload
        </label>
      </div>
    </>
  );
}

PhotosUploader.propTypes = {
  addedPhotos: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};
