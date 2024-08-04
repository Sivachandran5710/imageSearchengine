const dropdownContent = document.querySelector(".dropDown-content");
const dropdownSelectedValue = document.getElementById("dropdownSelectValue");
const dropDown = document.getElementById("dropDown"),
    searchText = document.getElementById("searchText"),
    searchClick = document.querySelector(".fa-magnifying-glass"),
    items = document.querySelector(".items"),
    loadMore = document.querySelector(".loadMore"),
    totalResults = document.getElementById("totalResults");

let page = 1,
    perPage = 15,
    searchItem = "Picture";

dropdownContent.addEventListener("click", (e) => {
    dropdownSelectedValue.innerHTML = e.target.innerHTML;
    dropDown.checked = false;
    searchItem = e.target.textContent.trim();
    loadMore.style.display = "none"; 
    items.innerHTML = "";
    totalResults.innerText = 0; 
});

window.addEventListener("load", () => {
    loadMore.style.display = "none";
    generateAPIResponse(searchItem, true);
});

searchClick.addEventListener("click", () => {
    generateAPIResponse(searchItem, true);
});

// Add event listener for Enter key press
searchText.addEventListener("keypress", (e) => {
    if (e.key === 'Enter') {
        generateAPIResponse(searchItem, true);
    }
});

function generateAPIResponse(searchItem, isNewSearch) {
    if (isNewSearch) {
        page = 1;
        items.innerHTML = "";
    } else {
        page++;
    }
    
    if (searchText.value.trim() === "") {
        items.innerHTML =
        `
        <div class="notFound">
            <p>Search term is empty</p>
            <h1>Please enter the search term</h1>
        </div>
        `;
        items.style.columns = "auto";
        totalResults.innerText = 0;
        return;
    }

    const APIKey = 'VzMxPwuk7WtVqfdFQbAEEaKhATKdfj2ETBXmASJcinS56liCPSAhz6mf';

    loadMore.style.display = "block";
    loadMore.innerText = "Loading...";
    let APIURL = `https://api.pexels.com/v1/search?query=${searchText.value}&page=${page}&per_page=${perPage}`;

    if (searchItem === "Video") {
        APIURL = `https://api.pexels.com/videos/search?query=${searchText.value}&page=${page}&per_page=${perPage}`;
    }

    fetch(APIURL, {
        headers: { Authorization: APIKey },
    })
    .then((response) => response.json())
    .then((results) => {
        console.log(results);

        totalResults.innerText = results.total_results;
        if (results.total_results === 0 || results.status === 400) {
            items.innerHTML =
            `
            <div class="notFound">
                <i class="fa-regular fa-face-frown fa-2x1"></i>
                <h1>${searchText.value}</h1>
                <p>Sorry, we couldn't find any matches</p>
                <br />
                <h2>Try another search term</h2>
            </div>
            `;

            items.style.columns = "auto";
            loadMore.style.display = "none";
            return;
        }
        loadMore.innerText = "Load more";
        
        if (results.photos) {
            results.photos.forEach((photo) => {
                generateImageItems(photo);
            });
        }
        if (results.videos) {
            results.videos.forEach((video) => {
                generateVideoItems(video);
            });
        }

        if (!results.next_page) {
            loadMore.style.display = "none";
        }
    })
    .catch((error) => {
        console.error('Error fetching data:', error);
    });
}

const generateImageItems = (item) => {
    let div = document.createElement("div");
    div.classList.add("card");

    div.innerHTML = `
    <img src="${item.src.original}" alt="${item.alt}" onclick="showPopupView('image', '${item.src.original}', '${item.photographer}')" />
    <div class="details">
        <div class="photographer">
            <i class="fa-solid fa-camera-retro"></i>
            <span>${item.photographer}</span>
        </div>
        <button onclick="downloadFile('image', '${item.src.original}')">
            <i class="fa-solid fa-download"></i>
        </button>
    </div>
    `;
    items.append(div);
}

const popupView = document.querySelector(".popupView");
const showPopupView = (type, element, name) => {
    let image = `<img src="${element}" />`;
    let video = `<video src="${element}" autoplay loop controls></video>`;

    popupView.querySelector(".previewItem").innerHTML = `
    <div class="elementItem">
    ${type === "image" ? image : video}
    </div>`;
    
    const downloadButton = popupView.querySelector("#downloadClick");
    downloadButton.setAttribute("data-type", type);
    downloadButton.setAttribute("data-file", element);

    popupView.querySelector("span").innerHTML = name;
    popupView.classList.add("show");
    
    document.body.style.overflow = "hidden";
};

document.getElementById("downloadClick").addEventListener("click", (e) => {
    const type = e.currentTarget.getAttribute("data-type");
    const fileurl = e.currentTarget.getAttribute("data-file");
    downloadFile(type, fileurl);
});

const hidePopupView = () => {
    popupView.classList.remove("show");
    document.body.style.overflow = "auto";
}

function downloadFile(type, fileurl) {
    if (type === 'image') {
        fetch(fileurl)
            .then((res) => res.blob())
            .then((blob) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = 'image.jpg';
                document.body.appendChild(a);
                a.click();
                a.remove();
            });
    } else {
        const a = document.createElement("a");
        a.href = fileurl;
        a.download = 'video.mp4';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
}

const generateVideoItems = (item) => {
    let div = document.createElement("div");
    div.classList.add("card");

    let videoEl = document.createElement("video");
    videoEl.src = item.video_files[1].link;
    videoEl.autoplay = false;
    videoEl.loop = true;
    videoEl.controls = false;

    videoEl.addEventListener("mouseenter", () => {
        videoEl.play();
    });
    videoEl.addEventListener("mouseleave", () => {
        videoEl.pause();
    });

    div.addEventListener("click", () => {
        showPopupView('video', item.video_files[1].link, item.user.name);
    });
    div.appendChild(videoEl);
    items.append(div);
}

loadMore.addEventListener("click", () => {
    generateAPIResponse(searchItem, false);
});
