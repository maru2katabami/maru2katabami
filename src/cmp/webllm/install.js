export default function Installer({ handleInit }) {

  const handleSubmit = event => {
    event.preventDefault()
    handleInit( event.target[0].value )
  }

  return (
    <form className="p-1 space-x-2 w-full h-10 flex justify-between items-center" onSubmit={ handleSubmit }>
      <select className="p-2 appearance-none w-40 truncate rounded-3xl bg-white text-black/30 hover:text-black">
        <optgroup label="Llama">
          <option value="Llama-3.2-1B-Instruct-q4f32_1-MLC">Llama-3.2-1B-Instruct-q4f32_1-MLC</option>
          <option value="Llama-3.2-1B-Instruct-q4f16_1-MLC">Llama-3.2-1B-Instruct-q4f16_1-MLC</option>
          <option value="Llama-3.2-1B-Instruct-q0f32-MLC">Llama-3.2-1B-Instruct-q0f32-MLC</option>
          <option value="Llama-3.2-1B-Instruct-q0f16-MLC">Llama-3.2-1B-Instruct-q0f16-MLC</option>
          <option value="Llama-3.2-3B-Instruct-q4f32_1-MLC">Llama-3.2-3B-Instruct-q4f32_1-MLC</option>
          <option value="Llama-3.2-3B-Instruct-q4f16_1-MLC">Llama-3.2-3B-Instruct-q4f16_1-MLC</option>
          <option value="Llama-3.1-8B-Instruct-q4f32_1-MLC-1k">Llama-3.1-8B-Instruct-q4f32_1-MLC-1k</option>
          <option value="Llama-3.1-8B-Instruct-q4f16_1-MLC-1k">Llama-3.1-8B-Instruct-q4f16_1-MLC-1k</option>
          <option value="Llama-3.1-8B-Instruct-q4f32_1-MLC">Llama-3.1-8B-Instruct-q4f32_1-MLC</option>
          <option value="Llama-3.1-8B-Instruct-q4f16_1-MLC">Llama-3.1-8B-Instruct-q4f16_1-MLC</option>
          <option value="Llama-2-7b-chat-hf-q4f16_1-MLC">Llama-2-7b-chat-hf-q4f16_1-MLC</option>
        </optgroup>
        <optgroup label="Hermes">
          <option value="Hermes-2-Theta-Llama-3-8B-q4f16_1-MLC">Hermes-2-Theta-Llama-3-8B-q4f16_1-MLC</option>
          <option value="Hermes-2-Theta-Llama-3-8B-q4f32_1-MLC">Hermes-2-Theta-Llama-3-8B-q4f32_1-MLC</option>
          <option value="Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC">Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC</option>
          <option value="Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC">Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC</option>
          <option value="Hermes-3-Llama-3.1-8B-q4f32_1-MLC">Hermes-3-Llama-3.1-8B-q4f32_1-MLC</option>
          <option value="Hermes-3-Llama-3.1-8B-q4f16_1-MLC">Hermes-3-Llama-3.1-8B-q4f16_1-MLC</option>
        </optgroup>
        <optgroup label="Phi">
          <option value="Phi-3.5-mini-instruct-q4f16_1-MLC">Phi-3.5-mini-instruct-q4f16_1-MLC</option>
          <option value="Phi-3.5-mini-instruct-q4f32_1-MLC">Phi-3.5-mini-instruct-q4f32_1-MLC</option>
        </optgroup>
        <optgroup label="Mistral">
          <option value="Mistral-7B-Instruct-v0.3-q4f16_1-MLC">Mistral-7B-Instruct-v0.3-q4f16_1-MLC</option>
        </optgroup>
        <optgroup label="Qwen">
          <option value="Qwen2.5-0.5B-Instruct-q4f16_1-MLC">Qwen2.5-0.5B-Instruct-q4f16_1-MLC</option>
          <option value="Qwen2.5-0.5B-Instruct-q4f32_1-MLC">Qwen2.5-0.5B-Instruct-q4f32_1-MLC</option>
          <option value="Qwen2.5-0.5B-Instruct-q0f16-MLC">Qwen2.5-0.5B-Instruct-q0f16-MLC</option>
          <option value="Qwen2.5-0.5B-Instruct-q0f32-MLC">Qwen2.5-0.5B-Instruct-q0f32-MLC</option>
          <option value="Qwen2.5-1.5B-Instruct-q4f16_1-MLC">Qwen2.5-1.5B-Instruct-q4f16_1-MLC</option>
          <option value="Qwen2.5-1.5B-Instruct-q4f32_1-MLC">Qwen2.5-1.5B-Instruct-q4f32_1-MLC</option>
          <option value="Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC">Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC</option>
        </optgroup>
        <optgroup label="TinyLlama">
          <option value="TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC">TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC</option>
          <option value="TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC">TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC</option>
        </optgroup>
        <optgroup label="StableLM">
          <option value="stablelm-2-zephyr-1_6b-q4f16_1-MLC">stablelm-2-zephyr-1_6b-q4f16_1-MLC</option>
          <option value="stablelm-2-zephyr-1_6b-q4f32_1-MLC">stablelm-2-zephyr-1_6b-q4f32_1-MLC</option>
        </optgroup>
        <optgroup label="RedPajama">
          <option value="RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC">RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC</option>
          <option value="RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC">RedPajama-INCITE-Chat-3B-v1-q4f32_1-MLC</option>
        </optgroup>
      </select>  
      <button className="p-2 flex-shrink-0 rounded-3xl bg-white" type="submit">INSTALL</button>
    </form>
  )
}