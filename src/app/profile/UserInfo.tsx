export function UserInfo() {
  return (
    <div className="bg-[#222] p-8 rounded-lg">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        {/* 왼쪽: 기존 UserInfo 내용 */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start flex-1">
          <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gray-300 mb-4 sm:mb-0 sm:mr-8"></div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold">Yoonseo Lee</h1>
            <div className="flex justify-center sm:justify-start space-x-2 mt-2">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">Designer</span>
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">Illustrator</span>
            </div>
            <div className="mt-4 text-gray-400">
              <p>from Hongik. Univ</p>
              <p>in Seoul, Republic of Korea</p>
              <p>web <a href="#" className="text-blue-400">www.yoonseolee.com</a></p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 기존 UserActions 내용 */}
        <div className="mt-8 lg:mt-0 lg:ml-8 w-full lg:w-auto lg:min-w-[200px]">
          <div className="flex justify-center lg:justify-between items-center mb-6">
            <div className="text-center mr-8 lg:mr-4">
              <p className="text-gray-400">Followers</p>
              <p className="text-2xl font-bold">298</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Following</p>
              <p className="text-2xl font-bold">305</p>
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <button className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700">
              Share
            </button>
            <button className="bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-600">
              Edit profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
