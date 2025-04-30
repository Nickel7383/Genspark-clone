import { ClipLoader } from 'react-spinners'

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
      <ClipLoader color="#4d4d4d" size={60} />
    </div>
  )
}
