// Demo file để kiểm tra logic tạo mã số phòng
// Không sử dụng trong production

export const RoomCodeDemo = {
  // Kiểm tra logic tạo mã số phòng
  testRoomCodeGeneration() {
    const roomTypes = ["Single Bed", "Double Bed", "Deluxe Room", "Family Suite"]
    
    roomTypes.forEach(type => {
      const code = this.generateRoomCode(type)
      console.log(`${type} -> ${code}`)
    })
  },

  generateRoomCode(roomType: string): string {
    const typeMap: { [key: string]: string } = {
      "Single Bed": "MSB",
      "Double Bed": "MDB", 
      "Deluxe Room": "MDR",
      "Family Suite": "MFS"
    }
    
    const prefix = typeMap[roomType] || "MRO"
    const randomNum = Math.floor(Math.random() * 900) + 100 // 100-999
    return `${prefix}${randomNum}`
  },

  // Kiểm tra logic tạo tên phòng
  testRoomNameGeneration() {
    const roomTypes = ["Single Bed", "Double Bed", "Deluxe Room", "Family Suite"]
    
    roomTypes.forEach(type => {
      const code = this.generateRoomCode(type)
      const roomName = `${code} - ${type}`
      console.log(`${type} -> ${code} -> ${roomName}`)
    })
  }
}

// Chạy demo
if (typeof window !== 'undefined') {
  console.log("=== Room Code Demo ===")
  RoomCodeDemo.testRoomCodeGeneration()
  console.log("=== Room Name Demo ===")
  RoomCodeDemo.testRoomNameGeneration()
}
