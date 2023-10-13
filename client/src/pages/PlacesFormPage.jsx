import { useEffect, useState } from "react";
import Perks from "../Perks";
import PhotosUploader from "../PhotosUploader";
import axios from "axios";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";

export default function PlacesFormPage() {
  const { id } = useParams();

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState("");
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);

  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get("/places/" + id).then((response) => {
      const { data } = response;
      setTitle(data.title);
      setAddress(data.address);
      setAddedPhotos(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extraInfo);
      setCheckIn(data.checkIn);
      setCheckOut(data.checkOut);
      setMaxGuests(data.maxGuests);
      setPrice(data.price);
    });
  }, [id]);

  function inputHeader(text) {
    return <h2 className="text-xl mt-4">{text}</h2>;
  }
  function inputHeaderDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }
  // shorten code in text
  function preInput(header, headerDescription) {
    return (
      <>
        {inputHeader(header)}
        {inputHeaderDescription(headerDescription)}
      </>
    );
  }

  //Add/Save new place when u complete form
  async function savePlace(event) {
    event.preventDefault();
    const placeData = {
      title,
      address,
      addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    };
    if (id) {
      //update
      await axios.put("/places", { id, ...placeData });
      setRedirect(true);
    } else {
      //new place
      await axios.post("/places", placeData);
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/account/places"} />;
  }

  return (
    <div>
      <AccountNav />
      <form onSubmit={savePlace}>
        {preInput(
          "Tiêu đề",
          "Tiêu đề cho địa điểm của bạn, nên ngắn gọn và hấp dẫn như trong quảng cáo."
        )}
        {/* <h2 className="text-xl mt-4">Tiêu đề</h2>
            <p className="text-gray-500 text-sm">
              Tiêu đề cho địa điểm của bạn, nên ngắn gọn và hấp dẫn như trong
              quảng cáo.
            </p> */}
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Vd: Khu nghỉ dưỡng thơ mộng..."
        />

        {preInput("Địa chỉ", "Địa chỉ nơi nghĩ dưỡng này.")}
        <input
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Địa chỉ"
        />

        {preInput(
          "Photos",
          "Tip: càng nhiều ảnh sẽ giúp lôi cuốn, hấp dẫn hơn cho nơi nghỉ dưỡng."
        )}
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

        {preInput(
          "Mô tả",
          "Mô tả chi tiết cho nơi nghĩ dường của bản, điều gì làm cho nó nổi bật, cuốn hút khách du lịch."
        )}
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />

        {preInput(
          "Đặc quyền",
          "Chọn những đặc quyền ưu tiền mà chỉ có nơi nghỉ dưỡng của bạn cung cấp."
        )}
        <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Perks selected={perks} onChange={setPerks} />
        </div>

        {/* extraInfo */}
        {preInput(
          "Thông tin bổ sung",
          "Những quy định, cho phép của chủ sở hữu..."
        )}
        <textarea
          value={extraInfo}
          onChange={(event) => setExtraInfo(event.target.value)}
        />

        {/* checkIn, checkOut, maxGuests */}
        {preInput(
          "Thời gian đặt/trả phòng, số lượng người tối đa",
          "Bổ sung thời gian ra/vào phòng, khu nghỉ dưỡng,... để hỗ trợ làm lau dọn sạch sẽ phòng."
        )}
        <div className="grid gap-2 sm:grid-cols-3">
          <div>
            <h3 className="text-lg mt-2 -mb-1">Thời gian Check in</h3>
            <input
              type="text"
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              placeholder="00:00"
            />
          </div>
          <div>
            <h3 className="text-lg mt-2 -mb-1">Thời gian rời phòng</h3>
            <input
              type="text"
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              placeholder="00:00"
            />
          </div>
          <div>
            <h3 className="text-lg mt-2 -mb-1">Số lượng khách tối đa</h3>
            <input
              type="number"
              value={maxGuests}
              onChange={(event) => setMaxGuests(event.target.value)}
              placeholder="2"
            />
          </div>
        </div>
        {preInput("Giá tiền một đêm", "Hãy chọn giá đúng.")}
        <input
          className="max-w-sm text-lg mt-2 -mb-1"
          type="number"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="2"
        />
        <div className="text-center my-6">
          <button className="primary max-w-xs mt-4">Save</button>
        </div>
      </form>
    </div>
  );
}
