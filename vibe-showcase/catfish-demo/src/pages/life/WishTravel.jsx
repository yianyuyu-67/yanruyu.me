import TravelRecords from './TravelRecords'

// “想去旅行”独立页：复用旅行页，但默认停在「想去旅行」标签页
export default function WishTravel() {
  return (
    <TravelRecords
      defaultTab="wish"
      title="想去旅行"
      subtitle="我们一起想去的地方"
    />
  )
}
