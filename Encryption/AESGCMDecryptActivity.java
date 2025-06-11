import java.nio.ByteBuffer;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.stereotype.Component;

import com.td.cts.eso.ae.exception.AEException;
import com.td.eso.annotations.Loggable;
import com.td.eso.annotations.PerformanceMonitor;
import com.td.eso.logger.ClefLogger;

@Component
public class AESGCMDecryptActivity extends Activity<Pair<String, String>, String> {

	private static final String ALGORITHM = "AES/GCM/NoPadding";
	private static final int TAG_LENGTH_BIT = 128;
	private static final int GCM_IV_LENGTH = 12;

	public String decrypt(byte[] encryptedData, byte[] rawEncryptionKey) {
		byte[] iv = null;
		byte[] encrypted = null;
		try {
			ByteBuffer byteBuffer = ByteBuffer.wrap(encryptedData);

			iv = new byte[GCM_IV_LENGTH];
			byteBuffer.get(iv);
			encrypted = new byte[byteBuffer.remaining()];
			byteBuffer.get(encrypted);

			final Cipher cipherDec = Cipher.getInstance(ALGORITHM);
			cipherDec.init(Cipher.DECRYPT_MODE, new SecretKeySpec(rawEncryptionKey, "AES"),
					new GCMParameterSpec(TAG_LENGTH_BIT, iv));

			return new String(cipherDec.doFinal(encrypted));
		} catch (Exception e) {
			ClefLogger.error(classLogger + methodLogger + "Error while encrypting: ", e);
			return "";
		}
	}

	@Override
	@Loggable
	@PerformanceMonitor
	protected String doExecution(Pair<String, String> input) throws AEException {
		String strToDecrypt = input.getLeft();
		String secret = input.getRight();
		return decrypt(Base64.getDecoder().decode(strToDecrypt), secret.getBytes());
	}

}
