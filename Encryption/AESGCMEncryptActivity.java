import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.lang3.tuple.Pair;
import org.springframework.stereotype.Component;

import com.td.cts.eso.ae.exception.AEException;
import com.td.eso.annotations.Loggable;
import com.td.eso.annotations.PerformanceMonitor;
import com.td.eso.logger.ClefLogger;

@Component
public class AESGCMEncryptActivity extends Activity<Pair<String, String>, String> {

	private static final String ALGORITHM = "AES/GCM/NoPadding";
	private static final int AES_KEY_SIZE = 128;
	private static final int GCM_IV_LENGTH = 12;
	public static final int GCM_TAG_LENGTH = 16; // in bytes

	public String encrypt(byte[] input, byte[] key) {

		try {
			// Initialise random and generate key
			SecureRandom secureRandom = new SecureRandom();
			SecretKey secretKey = new SecretKeySpec(key, "AES");
			byte[] iv = new byte[GCM_IV_LENGTH]; // NEVER REUSE THIS IV WITH SAME KEY
			secureRandom.nextBytes(iv);

			// Encrypt
			final Cipher cipher = Cipher.getInstance(ALGORITHM);
			GCMParameterSpec parameterSpec = new GCMParameterSpec(AES_KEY_SIZE, iv); // 128 bit auth tag length
			cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

			byte[] cipherText = cipher.doFinal(input);

			ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + cipherText.length);
			byteBuffer.put(iv);
			byteBuffer.put(cipherText);
			byte[] cipherMessage = byteBuffer.array();
			return Base64.getEncoder().encodeToString(cipherMessage);
		} catch (Exception e) {
			ClefLogger.error(classLogger + methodLogger + "Error while encrypting: ", e);
			return "";
		}
	}

	@Override
	@Loggable
	@PerformanceMonitor
	protected String doExecution(Pair<String, String> input) throws AEException {
		String strToEncrypt = input.getLeft();
		String secret = input.getRight();
		return encrypt(strToEncrypt.getBytes(), secret.getBytes());
	}
}
